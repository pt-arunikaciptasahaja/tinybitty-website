// OrderFormDistanceBased.tsx - Updated version with distance-based ongkir calculation
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFormSchema } from '@/lib/validation';
import { OrderFormData } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { buildWhatsAppMessage, sendWhatsAppOrder } from '@/lib/whatsapp';
import { calculateDeliveryCostWithFallback } from '@/lib/distanceDeliveryCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Lottie from 'lottie-react';
import deliveryAnimation from '@/data/delivery-man-bike.json';
import wilayahData from '@/data/jabodetabek-addresses.json';
import { MessageCircle, CheckCircle2, Clock, Truck, MapPin, Timer, AlertCircle } from 'lucide-react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281112010160';

// Map delivery method names from old format to new format
const mapDeliveryMethod = (oldMethod: string): string => {
  switch (oldMethod) {
    case 'gosend':
      return 'gosend';
    case 'gosendsameday':
      return 'gosendsameday';
    case 'grab':
      return 'grab';
    case 'paxel':
      return 'paxel';
    default:
      return 'gosend';
  }
};

// Get ETA based on delivery method
const getETA = (method: string): string => {
  switch (method.toLowerCase()) {
    case 'gosend':
      return '1-3 jam';
    case 'gosendsameday':
      return '3-6 jam';
    case 'grab':
      return '1-4 jam';
    case 'paxel':
      return '2-6 jam';
    default:
      return '1-3 jam';
  }
};

const capitalizeName = (name: string): string => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

interface DeliveryInfo {
  cost: number;
  zone: string;
  time: string;
  formattedCost: string;
  confidence?: string;
  isValid: boolean;
  validationError?: string;
  distanceKm?: number;
}

export default function OrderForm() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  
  // Address dropdown options
  const [availableKota, setAvailableKota] = useState<Record<string, string>>({});
  const [availableKecamatan, setAvailableKecamatan] = useState<Record<string, string>>({});
  const [availableKelurahan, setAvailableKelurahan] = useState<Record<string, string>>({});

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      provinsi: '',
      kota: '',
      kecamatan: '',
      kelurahan: '',
      detailedAddress: '',
      deliveryMethod: undefined,
      paymentMethod: undefined,
      notes: '',
    },
  });

  // Watch for changes in address and delivery method to calculate delivery cost
  const selectedProvinsi = form.watch('provinsi');
  const selectedKota = form.watch('kota');
  const selectedKecamatan = form.watch('kecamatan');
  const selectedKelurahan = form.watch('kelurahan');
  const detailedAddress = form.watch('detailedAddress');
  const deliveryMethod = form.watch('deliveryMethod');
  const paymentMethod = form.watch('paymentMethod');

  // Helper function to generate full address string for delivery calculation
  const generateFullAddress = () => {
    const parts = [];
    
    if (detailedAddress && detailedAddress.trim()) {
      parts.push(detailedAddress.trim());
    }
    
    if (selectedKecamatan && wilayahData.kecamatan[selectedKecamatan]) {
      parts.push(wilayahData.kecamatan[selectedKecamatan]);
    }
    
    if (selectedKota && wilayahData.kota[selectedKota]) {
      const kotaName = wilayahData.kota[selectedKota]
        .replace(/Kota Administrasi /g, '')
        .replace(/Kabupaten /g, '');
      parts.push(kotaName);
    }
    
    if (selectedProvinsi && wilayahData.provinsi[selectedProvinsi]) {
      const provinsiName = wilayahData.provinsi[selectedProvinsi]
        .replace(/Daerah Khusus Ibukota /g, '');
      parts.push(provinsiName);
    }
    
    if (!parts.join(', ').toLowerCase().includes('indonesia')) {
      parts.push('Indonesia');
    }
    
    return parts.join(', ');
  };

  // Helper function to update dropdown options based on selection
  const updateDropdownOptions = () => {
    if (selectedProvinsi) {
      const filteredKota: Record<string, string> = {};
      Object.entries(wilayahData.kota).forEach(([code, name]) => {
        if (code.startsWith(selectedProvinsi)) {
          filteredKota[code] = name;
        }
      });
      setAvailableKota(filteredKota);
      
      if (!selectedKota || !filteredKota[selectedKota]) {
        form.setValue('kota', '');
      }
    } else {
      setAvailableKota({});
      form.setValue('kota', '');
    }

    if (selectedKota) {
      const filteredKecamatan: Record<string, string> = {};
      Object.entries(wilayahData.kecamatan).forEach(([code, name]) => {
        if (code.startsWith(selectedKota)) {
          filteredKecamatan[code] = name;
        }
      });
      setAvailableKecamatan(filteredKecamatan);
      
      if (!selectedKecamatan || !filteredKecamatan[selectedKecamatan]) {
        form.setValue('kecamatan', '');
      }
    } else {
      setAvailableKecamatan({});
      form.setValue('kecamatan', '');
    }

    if (selectedKecamatan) {
      const filteredKelurahan: Record<string, string> = {};
      Object.entries(wilayahData.kelurahan).forEach(([code, name]) => {
        if (code.startsWith(selectedKecamatan)) {
          filteredKelurahan[code] = name;
        }
      });
      setAvailableKelurahan(filteredKelurahan);
      
      if (!selectedKelurahan || !filteredKelurahan[selectedKelurahan]) {
        form.setValue('kelurahan', '');
      }
    } else {
      setAvailableKelurahan({});
      form.setValue('kelurahan', '');
    }
  };

  // Update dropdown options when province changes
  useEffect(() => {
    updateDropdownOptions();
  }, [selectedProvinsi, selectedKota, selectedKecamatan]);

  // Calculate delivery cost when address or delivery method changes
  useEffect(() => {
    const fullAddress = generateFullAddress();
    
    if (fullAddress && fullAddress.length >= 10) {
      if (deliveryMethod) {
        const calculateDelivery = async () => {
          setIsCalculatingDelivery(true);
          try {
            // Use the new distance-based delivery calculation
            const calculation = calculateDeliveryCostWithFallback(
              fullAddress,
              deliveryMethod,
              cart,
              getTotalPrice(),
              selectedKelurahan,
              selectedKecamatan
            );
            
            const info: DeliveryInfo = {
              cost: calculation.cost,
              zone: calculation.zone.name,
              time: calculation.estimatedTime,
              formattedCost: calculation.formattedCost,
              confidence: calculation.confidence,
              isValid: calculation.isValidAddress,
              validationError: calculation.validationError,
              distanceKm: calculation.distanceKm
            };
            
            setDeliveryInfo(info);
            (window as any).__deliveryInfo = info;
          } catch (error) {
            console.error('Distance-based delivery calculation failed:', error);
            const info: DeliveryInfo = {
              cost: 0,
              zone: 'Error',
              time: 'N/A',
              formattedCost: 'Error calculating delivery',
              confidence: 'invalid',
              isValid: false,
              validationError: 'Unable to calculate delivery cost. Please try again.'
            };
            setDeliveryInfo(info);
            (window as any).__deliveryInfo = info;
          } finally {
            setIsCalculatingDelivery(false);
          }
        };

        calculateDelivery();
      } else {
        const info: DeliveryInfo = {
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Select delivery method',
          confidence: 'invalid',
          isValid: false,
          validationError: 'Please select a delivery method'
        };
        setDeliveryInfo(info);
        (window as any).__deliveryInfo = info;
      }
    } else {
      const info = null;
      setDeliveryInfo(info);
      (window as any).__deliveryInfo = null;
    }
  }, [selectedProvinsi, selectedKota, selectedKecamatan, selectedKelurahan, detailedAddress, deliveryMethod, cart, getTotalPrice]);

  const onSubmit = (data: OrderFormData) => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add products to cart first',
        variant: 'destructive',
      });
      return;
    }

    // Check if address is valid using distance calculation
    const fullAddress = generateFullAddress();
    if (deliveryInfo && !deliveryInfo.isValid) {
      toast({
        title: 'Invalid Address',
        description: 'Please check your address and try again',
        variant: 'destructive',
      });
      return;
    }

    // Check if delivery method is selected
    if (!deliveryMethod) {
      toast({
        title: 'Delivery method required',
        description: 'Please select a delivery method',
        variant: 'destructive',
      });
      return;
    }

    // Store order data and calculate total once
    setOrderData(data);
    setCustomerName(data.name);
    setOrderTotal(getTotalPrice());

    // Show confirmation modal first
    setShowConfirmationModal(true);
  };

  const handleConfirmOrder = () => {
    setShowConfirmationModal(false);
    setShowThankYouModal(true);
  };

  const handleEditOrder = () => {
    setShowConfirmationModal(false);
  };

  // Continue with the rest of the component (same as original)...
  return (
    <div className="space-y-6">
      <div className="bg-green-100 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800">✅ Distance-Based Ongkos Kirim System Active!</h3>
        <p className="text-sm text-green-700 mt-1">
          This version uses precise distance calculation from Jakarta coordinates for accurate pricing.
        </p>
      </div>
      
      {/* Rest of component would continue here */}
    </div>
  );
}