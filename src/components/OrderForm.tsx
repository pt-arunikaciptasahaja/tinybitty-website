import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFormSchema } from '@/lib/validation';
import { OrderFormData } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { buildWhatsAppMessage, sendWhatsAppOrder } from '@/lib/whatsapp';
import { calculateShippingCost } from '@/lib/shippingService';
import { calculateDeliveryCost, formatDeliveryCost } from '@/lib/deliveryCalculator';
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
import { kelurahanData } from '@/data/kelurahan-data';
import { MessageCircle, CheckCircle2, Truck, MapPin, Timer, AlertCircle, ShoppingBag } from 'lucide-react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281112010160';

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

// Helper function to convert text to camelCase
const toCamelCase = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => {
      // Handle words with dots, dashes, and numbers
      if (word.includes('.') || word.includes('-') || /^\d/.test(word)) {
        return word.toUpperCase();
      }
      // Regular words - capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

interface DeliveryInfo {
  cost: number;
  zone: string;
  time: string;
  formattedCost: string;
  isValid: boolean;
  validationError?: string;
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
  
  const [availableKota, setAvailableKota] = useState<Record<string, string>>({});
  const [availableKecamatan, setAvailableKecamatan] = useState<Record<string, string>>({});
  const [availableKelurahan, setAvailableKelurahan] = useState<Record<string, string>>({});
  
  const [clearedFields, setClearedFields] = useState<Set<string>>(new Set());
  const [lastKota, setLastKota] = useState('');
  const [lastKecamatan, setLastKecamatan] = useState('');
  const [hasCompletedDeliveryCalculation, setHasCompletedDeliveryCalculation] = useState(false);
  const [hasCalculatedDelivery, setHasCalculatedDelivery] = useState(false);
  
  // Debounced address calculation to prevent API calls on every keystroke
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      provinsi: 'DKI Jakarta',
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
  // Province is fixed to DKI Jakarta, so no need to watch it
  const selectedKota = form.watch('kota');
  const selectedKecamatan = form.watch('kecamatan');
  const selectedKelurahan = form.watch('kelurahan');
  const detailedAddress = form.watch('detailedAddress');
  const deliveryMethod = form.watch('deliveryMethod');
  const paymentMethod = form.watch('paymentMethod');

  // Reset delivery-related fields when address fields change
  const resetDeliveryFields = useCallback(() => {
    setIsCalculatingDelivery(false);
    form.setValue('deliveryMethod', undefined);
    setDeliveryInfo(null);
    setClearedFields(prev => {
      const updated = new Set(prev);
      updated.add('deliveryMethod');
      updated.add('paymentMethod');
      return updated;
    });
    
    // Clear payment method as well since it's related to delivery
    form.setValue('paymentMethod', undefined);
    setClearedFields(prev => {
      const updated = new Set(prev);
      updated.add('paymentMethod');
      return updated;
    });
    
    // Show cleared field notifications
    setTimeout(() => {
      setClearedFields(prev => {
        const updated = new Set(prev);
        updated.delete('deliveryMethod');
        updated.delete('paymentMethod');
        return updated;
      });
    }, 3000);
  }, []);

  const updateDropdownOptions = () => {
    const filteredKota = Object.keys(kelurahanData);
    setAvailableKota(filteredKota.reduce((acc, kota) => {
      acc[kota] = kota;
      return acc;
    }, {} as Record<string, string>));
    
    if (selectedKota !== lastKota) {
      const newlyCleared = new Set(clearedFields);
      let hasNewClears = false;
      
      // Reset delivery calculation tracking when address changes
      setHasCompletedDeliveryCalculation(false);
      
      if (selectedKecamatan) {
        form.setValue('kecamatan', '');
        newlyCleared.add('kecamatan');
        hasNewClears = true;
      }
      
      if (selectedKelurahan) {
        form.setValue('kelurahan', '');
        newlyCleared.add('kelurahan');
        hasNewClears = true;
      }
      
      if (detailedAddress) {
        form.setValue('detailedAddress', '');
        newlyCleared.add('detailedAddress');
        hasNewClears = true;
      }
      
      // Only clear delivery fields if address was complete and delivery method was actually selected
      if ((deliveryMethod || paymentMethod) && hasCompletedDeliveryCalculation) {
        form.setValue('deliveryMethod', undefined);
        form.setValue('paymentMethod', undefined);
        newlyCleared.add('deliveryMethod');
        newlyCleared.add('paymentMethod');
        hasNewClears = true;
        
        setDeliveryInfo(null);
        setIsCalculatingDelivery(false);
      }
      
      setDeliveryInfo(null);
      
      if (hasNewClears) {
        setClearedFields(newlyCleared);
        setTimeout(() => {
          setClearedFields(prev => {
            const updated = new Set(prev);
            updated.delete('kecamatan');
            updated.delete('kelurahan');
            updated.delete('detailedAddress');
            updated.delete('deliveryMethod');
            updated.delete('paymentMethod');
            return updated;
          });
        }, 3000);
      }
      
      setLastKota(selectedKota);
    }
    
    if (selectedKota && !filteredKota.includes(selectedKota)) {
      form.setValue('kota', '');
      return;
    }

    if (selectedKota) {
      const filteredKecamatan = Object.keys(kelurahanData[selectedKota] || {});
      setAvailableKecamatan(filteredKecamatan.reduce((acc, kecamatan) => {
        acc[kecamatan] = kecamatan;
        return acc;
      }, {} as Record<string, string>));
      
      if (selectedKecamatan !== lastKecamatan && selectedKecamatan) {
        const newlyCleared = new Set(clearedFields);
        
        if (selectedKelurahan) {
          form.setValue('kelurahan', '');
          newlyCleared.add('kelurahan');
          setTimeout(() => {
            setClearedFields(prev => {
              const updated = new Set(prev);
              updated.delete('kelurahan');
              return updated;
            });
          }, 3000);
        }
        
        setClearedFields(newlyCleared);
        setLastKecamatan(selectedKecamatan);
      }
      
      if (selectedKecamatan && !filteredKecamatan.includes(selectedKecamatan)) {
        form.setValue('kecamatan', '');
        return;
      }
    } else {
      setAvailableKecamatan({});
      form.setValue('kecamatan', '');
    }

    if (selectedKecamatan && selectedKota) {
      const filteredKelurahan = kelurahanData[selectedKota]?.[selectedKecamatan] || [];
      setAvailableKelurahan(filteredKelurahan.reduce((acc, kelurahan, index) => {
        acc[index.toString()] = kelurahan;
        return acc;
      }, {} as Record<string, string>));
      
      if (selectedKelurahan && !filteredKelurahan.includes(selectedKelurahan)) {
        form.setValue('kelurahan', '');
      }
    } else {
      setAvailableKelurahan({});
      form.setValue('kelurahan', '');
    }
  };

  useEffect(() => {
    updateDropdownOptions();
  }, [selectedKota, selectedKecamatan]);

  // Generate full address for display purposes (includes detailed address)
  const generateFullAddress = useCallback(() => {
    const parts = [];
    
    // Add detailed address first (street address, house number, etc.)
    if (detailedAddress && detailedAddress.trim()) {
      // Normalize common address abbreviations for better geocoding
      const normalizedAddress = detailedAddress
        .trim()
        .replace(/\bjl\.?\b/gi, 'Jalan')
        .replace(/\bstreet\b/gi, 'Jalan')
        .replace(/\brt\.?\s*(\d+)/gi, 'RT $1')
        .replace(/\brw\.?\s*(\d+)/gi, 'RW $1')
        .replace(/\bno\.?\s*(\d+)/gi, 'No $1')
        .trim();
      parts.push(toCamelCase(normalizedAddress));
    }
    
    // Then add administrative hierarchy with camelCase formatting
    if (selectedKelurahan) {
      const kelurahanName = kelurahanData[selectedKota]?.[selectedKecamatan]?.[parseInt(selectedKelurahan)];
      if (kelurahanName) {
        parts.push(toCamelCase(kelurahanName));
      }
    }
    
    if (selectedKecamatan && kelurahanData[selectedKota]?.[selectedKecamatan]) {
      parts.push(toCamelCase(selectedKecamatan));
    }
    
    if (selectedKota) {
      const kotaName = selectedKota
        .replace(/Kota Administrasi /g, '')
        .replace(/Kabupaten /g, '');
      parts.push(toCamelCase(kotaName));
    }
    
    // Always add Jakarta, Indonesia for better geocoding
    parts.push('Jakarta, Indonesia');
    
    return parts.join(', ');
  }, [detailedAddress, selectedKota, selectedKecamatan, selectedKelurahan]);

  // Generate simplified address for API calls (kelurahan level only - no detailed address)
  const generateKelurahanOnlyAddress = useCallback(() => {
    const parts = [];
    
    // Only add administrative hierarchy - NO detailed address for API calls
    if (selectedKelurahan) {
      const kelurahanName = kelurahanData[selectedKota]?.[selectedKecamatan]?.[parseInt(selectedKelurahan)];
      if (kelurahanName) {
        parts.push(toCamelCase(kelurahanName));
      }
    }
    
    if (selectedKecamatan && kelurahanData[selectedKota]?.[selectedKecamatan]) {
      parts.push(toCamelCase(selectedKecamatan));
    }
    
    if (selectedKota) {
      const kotaName = selectedKota
        .replace(/Kota Administrasi /g, '')
        .replace(/Kabupaten /g, '');
      parts.push(toCamelCase(kotaName));
    }
    
    // Always add Jakarta, Indonesia for better geocoding
    parts.push('Jakarta, Indonesia');
    
    return parts.join(', ');
  }, [selectedKota, selectedKecamatan, selectedKelurahan]);

  // Debounced function for delivery calculation
  const debouncedDeliveryCalculation = useCallback(() => {
    // Clear existing timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }

    // Set new timeout for 2 seconds to debounce API calls
    calculationTimeoutRef.current = setTimeout(() => {
      // Use kelurahan-only address for API calls to avoid geocoding errors
      const fullAddress = generateKelurahanOnlyAddress();
      const isDetailedAddressComplete = detailedAddress && detailedAddress.trim().length >= 8;
      const isAddressComplete = selectedKota && selectedKecamatan && isDetailedAddressComplete;
      
      // Only calculate delivery if address is complete, delivery method is selected,
      // and we haven't already calculated delivery for this specific combination
      if (isAddressComplete && deliveryMethod && !hasCompletedDeliveryCalculation) {
        const calculateNewDelivery = async () => {
          setIsCalculatingDelivery(true);
          let calculationSuccess = false;
          
          try {
            const calculation = await calculateShippingCost(fullAddress, deliveryMethod, cart);
            
            if (!calculation.isValidAddress) {
              const info = {
                cost: 0,
                zone: '',
                time: '',
                formattedCost: 'Address not found',
                isValid: false,
                validationError: 'Please check your address and try again'
              };
              setDeliveryInfo(info);
              calculationSuccess = false;
              return;
            }
            
            const formattedCost = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(calculation.cost);
            
            const estimatedTime = getETA(deliveryMethod);
            
            const info = {
              cost: calculation.cost,
              zone: calculation.zone.name,
              time: estimatedTime,
              formattedCost: formattedCost,
              isValid: true
            };
            setDeliveryInfo(info);
            calculationSuccess = true;
            setHasCompletedDeliveryCalculation(true);
          } catch (error) {
            try {
              const fallbackCalculation = calculateDeliveryCost(fullAddress, deliveryMethod, cart, getTotalPrice());
              const info = {
                cost: fallbackCalculation.cost,
                zone: fallbackCalculation.zone.name,
                time: fallbackCalculation.estimatedTime,
                formattedCost: formatDeliveryCost(fallbackCalculation.cost),
                isValid: true
              };
              setDeliveryInfo(info);
              calculationSuccess = true;
              setHasCompletedDeliveryCalculation(true);
            } catch (fallbackError) {
              const info = {
                cost: 0,
                zone: 'Error',
                time: 'N/A',
                formattedCost: 'Error calculating delivery',
                isValid: false,
                validationError: 'Unable to calculate delivery cost. Please try again.'
              };
              setDeliveryInfo(info);
              calculationSuccess = false;
              setHasCompletedDeliveryCalculation(false);
            }
          } finally {
            setIsCalculatingDelivery(false);
            // Mark that delivery has been calculated successfully
            if (calculationSuccess) {
              setHasCompletedDeliveryCalculation(true);
            }
            setHasCalculatedDelivery(calculationSuccess);
          }
        };

        calculateNewDelivery();
      } else if (isAddressComplete && !deliveryMethod) {
        const info = {
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Select delivery method',
          isValid: false,
          validationError: 'Please select a delivery method'
        };
        setDeliveryInfo(info);
      } else if (!isAddressComplete && deliveryMethod) {
        // Keep the calculator visible when delivery method is selected but address is incomplete
        const info = {
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Complete your address',
          isValid: false,
          validationError: 'Please complete your address to calculate delivery cost'
        };
        setDeliveryInfo(info);
      } else if (!isAddressComplete && !deliveryMethod) {
        // Clear calculator only when both address and delivery method are incomplete
        setDeliveryInfo(null);
      }
    }, 2000); // 2 second debounce
  }, [generateKelurahanOnlyAddress, detailedAddress, selectedKota, selectedKecamatan, deliveryMethod, hasCompletedDeliveryCalculation, cart, getTotalPrice]);

  useEffect(() => {
    // Only trigger calculation if all fields are complete
    const isDetailedAddressComplete = detailedAddress && detailedAddress.trim().length >= 8;
    const isAddressComplete = selectedKota && selectedKecamatan && isDetailedAddressComplete;
    
    if (isAddressComplete || deliveryMethod) {
      debouncedDeliveryCalculation();
    } else {
      // Clear any pending calculations if address is incomplete
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
        calculationTimeoutRef.current = null;
      }
      setDeliveryInfo(null);
    }
  }, [debouncedDeliveryCalculation]);

  // Reset delivery fields when address fields change after successful calculation
  useEffect(() => {
    if (hasCalculatedDelivery && hasCompletedDeliveryCalculation) {
      resetDeliveryFields();
    }
  }, [selectedKota, selectedKecamatan, selectedKelurahan, resetDeliveryFields]);

  const handleWhatsAppRedirect = () => {
    if (!orderData) return;
    
    const message = buildWhatsAppMessage(orderData, cart, orderTotal, deliveryInfo?.cost || 0);
    
    sendWhatsAppOrder(message, WHATSAPP_NUMBER);
    
    setShowThankYouModal(false);
    setOrderData(null);
    setOrderTotal(0);
    setDeliveryInfo(null);
    clearCart();
    form.reset();
    
    toast({
      title: 'WhatsApp opened!',
      description: 'Please send the message to complete your order',
    });
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }, 1000);
  };

  const onSubmit = (data: OrderFormData) => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add products to cart first',
        variant: 'destructive',
      });
      return;
    }

    const fullAddress = generateFullAddress();
    if (deliveryInfo && !deliveryInfo.isValid) {
      toast({
        title: 'Invalid Address',
        description: 'Please check your address and try again',
        variant: 'destructive',
      });
      return;
    }

    if (!deliveryMethod) {
      toast({
        title: 'Delivery method required',
        description: 'Please select a delivery method',
        variant: 'destructive',
      });
      return;
    }

    setOrderData(data);
    setCustomerName(data.name);
    setOrderTotal(getTotalPrice());

    setShowConfirmationModal(true);
  };

  const handleConfirmOrder = () => {
    setShowConfirmationModal(false);
    setShowThankYouModal(true);
  };

  const handleEditOrder = () => {
    setShowConfirmationModal(false);
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const { isValid, errors } = form.formState;
  
  const isStep1Complete = form.watch('name') && form.watch('phone') &&
    form.watch('name').trim() !== '' && form.watch('phone').trim() !== '';
  
  const isAddressComplete = selectedKota && selectedKecamatan &&
    detailedAddress && detailedAddress.trim().length >= 8;
  
  const isStep2Complete = isAddressComplete;
  const isStep3Complete = deliveryMethod && deliveryMethod.trim() !== '';
  const isStep4Complete = paymentMethod && paymentMethod.trim() !== '';
  
  const currentStep = !isStep1Complete ? 1 :
                     !isStep2Complete ? 2 :
                     !isStep3Complete ? 3 :
                     !isStep4Complete ? 4 : 4;
  
  // Calculate the next step more logically
  const getNextStep = () => {
    if (!isStep1Complete) return 1;
    if (!isStep2Complete) return 2;
    if (!isStep3Complete) return 3;
    if (!isStep4Complete) return 4;
    return 4; // All complete
  };
  
  const nextStep = getNextStep();
  
  const stepProgress = (currentStep - 1) / 4 * 100;

  return (
<section id="order" className="mb-12 md:mb-16 py-16 order-form-texture rounded-3xl">
  <div className="container mx-auto px-4 max-w-3xl">
    <Card className="border-2 border-[#D8CFF7]/40 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-[#F6F2FF] border-b border-[#D8CFF7]/40">
        <CardTitle className="text-2xl font-bold text-[#5D4E8E] flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-[#BFAAE3]" />
          Form Pemesanan
        </CardTitle>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-[#8978B4] mb-2">
            <span>Langkah {currentStep} dari 4</span>
            <span>
              {currentStep === 4 && isStep4Complete ? 'Form selesai!' : 'Lengkapi dulu ya!'}
            </span>
          </div>
          <div className="w-full bg-[#D8CFF7]/20 rounded-full h-2">
            <div
              className="bg-[#BFAAE3] h-2 rounded-full transition-all duration-300"
              style={{ width: `${stepProgress + (currentStep === 4 ? 25 : 0)}%` }}
            ></div>
          </div>
        </div>
        <CardDescription className="text-[#8978B4]">
          {currentStep === 1 && 'Mulai dengan mengisi nama dan nomor WhatsApp kamu'}
          {currentStep === 2 && 'Lengkapi alamat pengiriman kamu'}
          {currentStep === 3 && 'Cek ongkir dan pilih kurir pengiriman'}
          {currentStep === 4 && 'Data kamu sudah lengkap, yuk lanjut order sekarang!'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Data Kontak */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-[#F6F2FF] border-[#D8CFF7]'
                  : isStep1Complete
                  ? 'bg-green-50 border-green-200'
                  : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isStep1Complete
                      ? 'bg-green-500 text-white'
                      : currentStep === 1
                      ? 'bg-[#BFAAE3] text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  1
                </div>
                <h3 className="font-semibold text-[#5D4E8E]">Data Kontak</h3>
                {isStep1Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E] font-semibold">Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap kamu"
                        {...field}
                        className="rounded-xl text-[#5D4E8E] border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E] font-semibold">
                      Nomor WhatsApp
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={15}
                        className="rounded-xl text-[#5D4E8E] border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
                        value={field.value}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, '');
                          field.onChange(onlyDigits);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <p className="text-xs text-[#8978B4] mt-1">
                      Hanya nomor Indonesia (0 atau 62 di depan), tanpa spasi atau simbol.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2: Alamat Pengiriman */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                currentStep === 2
                  ? 'bg-[#F6F2FF] border-[#D8CFF7]'
                  : isStep2Complete
                  ? 'bg-green-50 border-green-200'
                  : !isStep1Complete
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isStep2Complete
                      ? 'bg-green-500 text-white'
                      : currentStep === 2
                      ? 'bg-[#BFAAE3] text-white'
                      : !isStep1Complete
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-[#D8CFF7] text-[#5D4E8E]'
                  }`}
                >
                  2
                </div>
                <h3 className="font-semibold text-[#5D4E8E]">📍 Alamat Lengkap</h3>
                {isStep2Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>

              <FormField
                control={form.control}
                name="provinsi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E]">Provinsi</FormLabel>
                    <Select value="DKI  Jakarta" disabled={true}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-[#D8CFF7]/40 bg-gray-100 cursor-not-allowed">
                          <SelectValue>DKI Jakarta</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Kota Dropdown */}
              <FormField
                control={form.control}
                name="kota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E]">Kota</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                      disabled={!isStep1Complete}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white ${
                            !isStep1Complete ? 'bg-gray-100 cursor-not-allowed' : ''
                          } ${
                            clearedFields.has('kota') ? 'border-amber-300 bg-amber-50' : ''
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              !isStep1Complete
                                ? 'Lengkapi data kontak dulu'
                                : 'Pilih Kota'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(availableKota).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {clearedFields.has('kota') && (
                      <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        💡 Field ini dikosongkan otomatis karena perubahan field sebelumnya
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kecamatan Dropdown */}
              <FormField
                control={form.control}
                name="kecamatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E]">Kecamatan</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setLastKecamatan(value);
                        setClearedFields((prev) => {
                          const updated = new Set(prev);
                          updated.delete('kecamatan');
                          return updated;
                        });
                      }}
                      disabled={!selectedKota || !isStep1Complete}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white ${
                            !selectedKota || !isStep1Complete
                              ? 'bg-gray-100 cursor-not-allowed'
                              : ''
                          } ${
                            clearedFields.has('kecamatan')
                              ? 'border-amber-300 bg-amber-50'
                              : ''
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              !isStep1Complete
                                ? 'Lengkapi data kontak dulu'
                                : !selectedKota
                                ? 'Pilih Kota terlebih dahulu'
                                : 'Pilih Kecamatan'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(availableKecamatan).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kelurahan Dropdown */}
              <FormField
                control={form.control}
                name="kelurahan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[#5D4E8E]">
                      Kelurahan
                      {clearedFields.has('kelurahan') && (
                        <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                          ✨ Dikosongkan - Pilih ulang
                        </span>
                      )}
                    </FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setClearedFields((prev) => {
                          const updated = new Set(prev);
                          updated.delete('kelurahan');
                          return updated;
                        });
                      }}
                      disabled={
                        !selectedKecamatan ||
                        Object.keys(availableKelurahan).length === 0 ||
                        !isStep1Complete
                      }
                    >
                      <FormControl>
                        <SelectTrigger
                          className={`rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white ${
                            !selectedKecamatan || !isStep1Complete ? 'bg-gray-100' : ''
                          } ${
                            clearedFields.has('kelurahan')
                              ? 'border-amber-300 bg-amber-50'
                              : ''
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              !isStep1Complete
                                ? 'Lengkapi data kontak dulu'
                                : !selectedKecamatan
                                ? 'Pilih kecamatan terlebih dahulu'
                                : Object.keys(availableKelurahan).length > 0
                                ? 'Pilih kelurahan'
                                : 'Data kelurahan tidak tersedia'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(availableKelurahan).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Detailed Address Input */}
              <FormField
                control={form.control}
                name="detailedAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E]">
                      Detail Alamat (Jalan, Nomor Rumah, dll)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Jl. Kemang Raya No. 123 RT 001 RW 002"
                        {...field}
                        disabled={!isStep1Complete}
                        className={`rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white min-h-[80px] placeholder:text-gray-400 ${
                          !isStep1Complete ? 'bg-gray-100 cursor-not-allowed' : ''
                        } ${
                          clearedFields.has('detailedAddress')
                            ? 'border-amber-300 bg-amber-50'
                            : ''
                        }`}
                        onChange={(e) => {
                          field.onChange(e);
                          if (clearedFields.has('detailedAddress') && e.target.value.trim()) {
                            setClearedFields((prev) => {
                              const updated = new Set(prev);
                              updated.delete('detailedAddress');
                              return updated;
                            });
                          }
                          // Reset delivery calculation flag when address changes
                          if (e.target.value.length < detailedAddress?.length && deliveryMethod) {
                            setHasCompletedDeliveryCalculation(false);
                            setDeliveryInfo(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

{/* Step 3: Cek Ongkir / Kurir */}
<div
  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
    currentStep === 3
      ? 'bg-[#F6F2FF] border-[#D8CFF7]'
      : isStep3Complete
      ? 'bg-green-50 border-green-200'
      : !isStep2Complete
      ? 'bg-gray-50 border-gray-200'
      : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
  }`}
>
  <div className="flex items-center gap-2 mb-3">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
        isStep3Complete
          ? 'bg-green-500 text-white'
          : currentStep === 3
          ? 'bg-[#BFAAE3] text-white'
          : !isStep2Complete
          ? 'bg-gray-300 text-gray-500'
          : 'bg-[#D8CFF7] text-[#5D4E8E]'
      }`}
    >
      3
    </div>
    <h3 className="font-semibold text-[#5D4E8E]">
      Cek Ongkir Dulu Yuk! 🚚
    </h3>
    {isStep3Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
  </div>

  <FormField
    control={form.control}
    name="deliveryMethod"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-[#5D4E8E] font-semibold">
          Pilih Kurir / Metode Pengiriman
        </FormLabel>
        <Select
          value={field.value || ''}
          onValueChange={(value) => {
            field.onChange(value);
            // Reset flag kalkulasi ongkir ketika ganti metode
            setHasCompletedDeliveryCalculation(false);
            setClearedFields((prev) => {
              const updated = new Set(prev);
              updated.delete('deliveryMethod');
              return updated;
            });
          }}
          disabled={!isStep2Complete || isCalculatingDelivery}
        >
          <FormControl>
            <SelectTrigger
              className={`rounded-xl border-[#D8CFF7]/40 bg-white ${
                !isStep2Complete ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${
                clearedFields.has('deliveryMethod')
                  ? 'border-amber-300 bg-amber-50'
                  : ''
              }`}
            >
              <SelectValue
                placeholder={
                  !isStep2Complete
                    ? 'Lengkapi alamat dulu'
                    : 'Pilih kurir / metode pengiriman'
                }
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="gosend">GoSend Instant</SelectItem>
            <SelectItem value="gosendsameday">GoSend SameDay</SelectItem>
            <SelectItem value="grab">GrabExpress Instant</SelectItem>
            <SelectItem value="paxel">Paxel</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

{/* Ongkir Display */}
{(deliveryInfo || isCalculatingDelivery) && (
  <Card
    className={`border-2 shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${
      deliveryInfo?.isValid
        ? 'bg-gradient-to-br from-[#F6F2FF] to-[#F0E8FF] border-[#BFAAE3] shadow-[#BFAAE3]/20'
        : 'bg-red-50 border-red-200'
    }`}
  >
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[#5D4E8E] font-bold text-lg bg-white/50 rounded-xl p-3 border border-[#BFAAE3]/20">
          <div className="p-2 bg-[#BFAAE3] rounded-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="flex-1 text-lg">Kalkulator Ongkir</span>
          {isCalculatingDelivery && (
            <div className="hidden md:flex items-center gap-2 text-sm text-[#8978B4] bg-[#BFAAE3]/10 px-3 py-1 rounded-full">
              <div className="w-4 h-4 border-2 border-[#BFAAE3]/30 border-t-[#BFAAE3] rounded-full animate-spin"></div>
              Menghitung ongkir...
            </div>
          )}
        </div>

        {isCalculatingDelivery && (
          <div className="md:hidden mt-2 w-full flex items-center justify-center gap-2 text-sm text-[#8978B4] bg-[#BFAAE3]/10 px-3 py-1 rounded-full">
            <div className="w-4 h-4 border-2 border-[#BFAAE3]/30 border-t-[#BFAAE3] rounded-full animate-spin"></div>
            Menghitung ongkir...
          </div>
        )}

        {!isCalculatingDelivery && deliveryInfo && !deliveryInfo.isValid ? (
          <div className="text-red-600 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{deliveryInfo.validationError}</span>
            </div>
          </div>
        ) : !isCalculatingDelivery && deliveryInfo ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 rounded-xl p-4 border border-[#BFAAE3]/20 hover:bg-white/80 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#BFAAE3]/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#BFAAE3]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#5D4E8E] text-sm">
                      Perkiraan Jarak
                    </div>
                    <div className="text-[#8978B4] font-medium">
                      {deliveryInfo.zone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4 border border-[#BFAAE3]/20 hover:bg-white/80 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#BFAAE3]/10 rounded-lg">
                    <Timer className="w-5 h-5 text-[#BFAAE3]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#5D4E8E] text-sm">
                      Estimasi Waktu Pengiriman
                    </div>
                    <div className="text-[#8978B4] font-medium">
                      {deliveryInfo.time}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#BFAAE3] to-[#9D85D0] rounded-xl p-4 border border-[#BFAAE3] hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      Perkiraan Ongkir
                    </div>
                    <div className="text-white font-bold text-lg">
                      {deliveryInfo.formattedCost}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note: ongkir masih perkiraan */}
            <p className="text-xs md:text-sm text-[#8978B4] bg-white/60 rounded-lg px-3 py-2 border border-[#BFAAE3]/20">
              Perkiraan ongkir. Ongkir final mengikuti aplikasi GoSend/GrabExpress
              (belum termasuk tol/parkir/tip).
            </p>
          </>
        ) : isCalculatingDelivery ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/40 rounded-xl p-4 border border-[#BFAAE3]/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BFAAE3]/20 rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-[#BFAAE3]/30 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-[#BFAAE3]/20 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-[#BFAAE3]/10 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/40 rounded-xl p-4 border border-[#BFAAE3]/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BFAAE3]/20 rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-[#BFAAE3]/30 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-[#BFAAE3]/20 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-[#BFAAE3]/10 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/40 rounded-xl p-4 border border-[#BFAAE3]/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BFAAE3]/20 rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-[#BFAAE3]/30 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-[#BFAAE3]/20 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-[#BFAAE3]/10 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </CardContent>
  </Card>
)}

{/* Step 4: Metode Pembayaran */}
<div
  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
    paymentMethod
      ? 'bg-green-50 border-green-200'
      : currentStep === 4
      ? 'bg-[#F6F2FF] border-[#D8CFF7]'
      : isStep4Complete
      ? 'bg-green-50 border-green-200'
      : !isStep3Complete
      ? 'bg-gray-50 border-gray-200'
      : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
  }`}
>
  <div className="flex items-center gap-2 mb-3">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
        isStep4Complete
          ? 'bg-green-500 text-white'
          : currentStep === 4
          ? 'bg-[#BFAAE3] text-white'
          : !isStep3Complete
          ? 'bg-gray-300 text-gray-500'
          : 'bg-[#D8CFF7] text-[#5D4E8E]'
      }`}
    >
      4
    </div>
    <h3 className="font-semibold text-[#5D4E8E]">💳 Metode Pembayaran</h3>
    {isStep4Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
  </div>

  <FormField
    control={form.control}
    name="paymentMethod"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-[#5D4E8E] font-semibold">
          Pilih Metode Pembayaran
        </FormLabel>
        <Select
          value={field.value || ''}
          onValueChange={(value) => {
            field.onChange(value);
            setClearedFields((prev) => {
              const updated = new Set(prev);
              updated.delete('paymentMethod');
              return updated;
            });
          }}
          disabled={!isStep3Complete}
        >
          <FormControl>
            <SelectTrigger
              className={`rounded-xl border-[#D8CFF7]/40 bg-white ${
                !isStep3Complete ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${
                clearedFields.has('paymentMethod')
                  ? 'border-amber-300 bg-amber-50'
                  : ''
              }`}
            >
              <SelectValue
                placeholder={
                  !isStep3Complete
                    ? 'Cek ongkir & pilih kurir dulu'
                    : 'Pilih metode pembayaran'
                }
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="transfer">Transfer Bank</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Catatan (Opsional) */}
  <FormField
    control={form.control}
    name="notes"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-[#5D4E8E] font-semibold">
          Catatan Tambahan (Opsional)
        </FormLabel>
        <FormControl>
          <Textarea
            placeholder="Contoh: Tolong kirim sore hari, atau tanpa es, dll."
            {...field}
            className="rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

{/* Ringkasan Pesanan */}
{cart.length > 0 && deliveryInfo?.isValid && (
  <Card className="bg-[#F6F2FF] border-[#D8CFF7]/40">
    <CardContent className="p-4">
      <div className="space-y-2">
        <div className="font-semibold text-[#5D4E8E] mb-3">Ringkasan Pesanan</div>

        <div className="flex justify-between text-sm">
          <span className="text-[#8978B4]">Subtotal Produk</span>
          <span className="text-[#5D4E8E] font-medium">
            Rp {getTotalPrice().toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-[#8978B4]">Perkiraan Ongkir</span>
          <span className="font-medium text-[#5D4E8E]">
            {deliveryInfo.formattedCost}
          </span>
        </div>

        <div className="border-t border-[#D8CFF7]/40 pt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-[#5D4E8E]">Total Pembayaran</span>
            <span className="text-[#BFAAE3]">
              Rp {(getTotalPrice() + deliveryInfo.cost).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{/* Ringkasan Validasi */}
{Object.keys(errors).length > 0 && cart.length > 0 && (
  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
    <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
      <AlertCircle className="w-5 h-5" />
      <span>Ada data yang perlu dilengkapi dulu:</span>
    </div>
    <div className="space-y-2 text-sm text-red-600">
      {errors.name && <div>• Nama lengkap</div>}
      {errors.phone && <div>• Nomor WhatsApp</div>}
      {!selectedKota && <div>• Kota/Kabupaten</div>}
      {!selectedKecamatan && <div>• Kecamatan</div>}
      {!detailedAddress?.trim() && <div>• Detail alamat</div>}
      {!deliveryMethod && <div>• Cek ongkir & pilih kurir</div>}
      {!paymentMethod && <div>• Metode pembayaran</div>}
    </div>
  </div>
)}

{cart.length === 0 && (
  <div className="text-xs text-red-500 flex items-center gap-2">
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    <span>Belum ada produk di keranjang. Yuk pilih menu favoritmu dulu!</span>
    <button
      onClick={scrollToProducts}
      className="ml-auto flex items-center gap-1 bg-[#BFAAE3] hover:bg-[#9D85D0] text-white px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 flex-shrink-0"
    >
      <ShoppingBag className="w-3 h-3" />
      Lihat Menu
    </button>
  </div>
)}

<Button
  type="submit"
  disabled={!isStep4Complete || !deliveryInfo?.isValid || cart.length === 0}
  className={`w-full transition-all duration-300 rounded-xl py-6 text-lg font-semibold flex items-center justify-center gap-2 ${
    isStep4Complete && deliveryInfo?.isValid && cart.length > 0
      ? 'bg-[#BFAAE3] hover:bg-[#9D85D0] text-white shadow-lg hover:shadow-xl text-md'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
>
  <MessageCircle className="w-5 h-5" />
  {isStep4Complete && deliveryInfo?.isValid && cart.length > 0
    ? 'Yuk checkout via WhatsApp 🚀'
    : `Lanjut ke Langkah ${nextStep}`}
</Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  </div>

{/* Thank You Modal - Updated with Manual WhatsApp Button */}
<Dialog open={showThankYouModal} onOpenChange={() => {}}>
  <DialogContent className="sm:max-w-lg bg-white border-2 border-[#D8CFF7]/40 rounded-3xl shadow-2xl p-0 overflow-hidden">
    <div className="bg-[#F6F2FF] border-b-2 border-[#D8CFF7]/40 px-6 py-6 text-center">
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 bg-[#BFAAE3] rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
      </div>

      <DialogTitle className="text-xl font-bold text-[#5D4E8E] mb-2">
        Terima kasih, {toCamelCase(customerName)}
      </DialogTitle>

      <DialogDescription className="text-[#8978B4] text-sm">
        Data pesanan kamu sudah kami terima.
      </DialogDescription>
    </div>

    <div className="px-6 py-6">
      <div className="text-center mb-6">
        <p className="text-[#5D4E8E] text-sm leading-relaxed mb-4">
          Tim Tiny Bitty akan menghubungi kamu melalui WhatsApp untuk konfirmasi pesanan,
          alamat, dan detail pengiriman agar semuanya jelas dan rapi.
        </p>

        {/* Manual WhatsApp Button */}
        <div className="bg-[#F6F2FF] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-[#5D4E8E]" />
            <p className="text-[#5D4E8E] font-semibold text-base">
              Lanjut konfirmasi via WhatsApp
            </p>
          </div>

          <Button
            onClick={handleWhatsAppRedirect}
            className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-2"
          >
            <MessageCircle className="w-5 h-5" />
            Buka WhatsApp
          </Button>

          <p className="text-[#8978B4] text-xs">
            Klik tombol di atas untuk membuka WhatsApp dan mengirim pesan pesanan ke Tiny Bitty.
          </p>
        </div>

        <p className="text-[#8978B4] text-xs">
          Terima kasih sudah memilih Tiny Bitty.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-44 h-44 bg-[#F6F2FF] rounded-3xl flex items-center justify-center border-2 border-[#D8CFF7]/40">
          <Lottie
            animationData={deliveryAnimation}
            loop={true}
            className="w-36 h-36"
          />
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>


{/* Order Confirmation Modal */}
<Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
  <DialogContent
    className="
      sm:max-w-2xl
      bg-white
      border-2 border-[#D8CFF7]/40
      rounded-3xl
      shadow-2xl
      p-0
      overflow-hidden
      max-h-[80vh]
      flex flex-col
    "
  >
    <div className="bg-[#F6F2FF] border-b-2 border-[#D8CFF7]/40 px-6 py-6 flex-shrink-0">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-[#5D4E8E] flex items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-[#BFAAE3]" />
          Cek Ulang Pesanan Kamu
        </DialogTitle>
        <DialogDescription className="text-[#8978B4]">
          Tolong cek lagi detail pesanan di bawah ini sebelum dikirim via WhatsApp 😊
        </DialogDescription>
      </DialogHeader>
    </div>

    <div className="px-6 py-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#F6F2FF] [&::-webkit-scrollbar-thumb]:bg-[#D8CFF7] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#BFAAE3]">
      {orderData && (
        <div className="space-y-4">
          {/* Customer Details */}
          <div className="bg-[#F6F2FF] rounded-2xl p-4">
            <h3 className="font-semibold text-[#5D4E8E] mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#BFAAE3]" />
              Data Pemesan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#8978B4]">Nama:</span>
                <div className="font-medium text-[#5D4E8E]">{toCamelCase(orderData.name)}</div>
              </div>
              <div>
                <span className="text-[#8978B4]">Nomor WhatsApp:</span>
                <div className="font-medium text-[#5D4E8E]">{orderData.phone}</div>
              </div>
              <div className="md:col-span-2">
                <span className="text-[#8978B4]">Alamat Lengkap:</span>
                <div className="font-medium text-[#5D4E8E]">{generateFullAddress()}</div>
              </div>
              <div>
                <span className="text-[#8978B4]">Kurir / Ongkir:</span>
                <div className="font-medium text-[#5D4E8E]">
                  {deliveryMethod === 'gosend' && 'GoSend Instant'}
                  {deliveryMethod === 'gosendsameday' && 'GoSend Same Day'}
                  {deliveryMethod === 'grab' && 'GrabExpress Instant'}
                  {deliveryMethod === 'paxel' && 'Paxel'}
                  {deliveryMethod === 'pickup' && 'Ambil sendiri (pickup)'}
                </div>
              </div>
              <div>
                <span className="text-[#8978B4]">Metode Pembayaran:</span>
                <div className="font-medium text-[#5D4E8E]">Transfer Bank</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl border-2 border-[#D8CFF7]/40 p-4">
            <h3 className="font-semibold text-[#5D4E8E] mb-3 flex items-center gap-2">
              🛒 Produk Dipesan ({cart.length} item)
            </h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variant.size}`}
                  className="flex items-center gap-3 p-3 bg-[#F6F2FF] rounded-xl"
                >
                  <div
                    className="w-12 h-12 bg-cover bg-center bg-no-repeat rounded-xl flex-shrink-0"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#5D4E8E] text-sm truncate">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-[#8978B4]">{item.variant.size}</p>
                    <p className="text-xs text-[#BFAAE3] font-medium">
                      {item.quantity}x Rp {item.variant.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#5D4E8E]">
                      Rp {(item.variant.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          {deliveryInfo && deliveryInfo.isValid && (
            <div className="bg-[#F6F2FF] rounded-2xl p-4">
              <h3 className="font-semibold text-[#5D4E8E] mb-3">Ringkasan Pembayaran</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8978B4]">Subtotal Produk</span>
                  <span className="text-[#5D4E8E]">
                    Rp {getTotalPrice().toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8978B4]">Perkiraan Ongkir</span>
                  <span className="text-[#5D4E8E]">
                    Rp {deliveryInfo.cost.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="border-t border-[#D8CFF7]/40 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-[#5D4E8E]">Total Pembayaran</span>
                    <span className="text-[#BFAAE3]">
                      Rp {(getTotalPrice() + deliveryInfo.cost).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleEditOrder}
              variant="outline"
              className="flex-1 border-2 border-[#D8CFF7]/40 text-[#5D4E8E] hover:bg-[#F6F2FF] py-3 rounded-xl font-medium"
            >
              Edit Pesanan
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="flex-1 bg-[#BFAAE3] hover:bg-[#9D85D0] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Konfirmasi
            </Button>
          </div>

          {orderData.notes && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
              <h4 className="font-medium text-[#5D4E8E] mb-2">📝 Catatan Tambahan</h4>
              <p className="text-sm text-[#8978B4]">{orderData.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>

    </section>
  );
}
