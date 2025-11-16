import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFormSchema } from '@/lib/validation';
import { OrderFormData } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { buildWhatsAppMessage, sendWhatsAppOrder } from '@/lib/whatsapp';
import { calculateDeliveryCost, formatDeliveryCost, getDeliveryInfo, validateAddress } from '@/lib/deliveryCalculator';
import { calculateShippingCost, getQuickShippingEstimate } from '@/lib/shippingService';
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
}

export default function OrderForm() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [timer, setTimer] = useState(5);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  
  // Address dropdown options
  const [availableKota, setAvailableKota] = useState<Record<string, string>>({});
  const [availableKecamatan, setAvailableKecamatan] = useState<Record<string, string>>({});
  const [availableKelurahan, setAvailableKelurahan] = useState<Record<string, string>>({});

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',        // ✅ validate while typing
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      // Legacy field (will be deprecated)
      address: '',
      // New structured address fields
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

  // Async function to calculate shipping cost using the new distance-based engine
  const calculateShippingCosts = async (fullAddress: string, method: string) => {
    try {
      const calculation = await calculateShippingCost(fullAddress, method, cart);
      return {
        cost: calculation.cost,
        zone: calculation.zone.name,
        time: calculation.estimatedTime,
        formattedCost: formatDeliveryCost(calculation.cost),
        confidence: calculation.confidence,
        isValid: calculation.isValidAddress
      };
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      // Fallback to the old calculation method
      const fallbackCalculation = calculateDeliveryCost(fullAddress, method, cart, getTotalPrice());
      return {
        cost: fallbackCalculation.cost,
        zone: fallbackCalculation.zone.name,
        time: fallbackCalculation.estimatedTime,
        formattedCost: formatDeliveryCost(fallbackCalculation.cost),
        confidence: fallbackCalculation.confidence,
        isValid: fallbackCalculation.isValidAddress
      };
    }
  };

  // Helper function to generate full address string for delivery calculation
  const generateFullAddress = () => {
    const parts = [];
    
    if (selectedProvinsi && wilayahData.provinsi[selectedProvinsi]) {
      parts.push(wilayahData.provinsi[selectedProvinsi]);
    }
    if (selectedKota && wilayahData.kota[selectedKota]) {
      parts.push(wilayahData.kota[selectedKota]);
    }
    if (selectedKecamatan && wilayahData.kecamatan[selectedKecamatan]) {
      parts.push(wilayahData.kecamatan[selectedKecamatan]);
    }
    if (selectedKelurahan && wilayahData.kelurahan[selectedKelurahan]) {
      parts.push(wilayahData.kelurahan[selectedKelurahan]);
    }
    if (detailedAddress && detailedAddress.trim()) {
      parts.push(detailedAddress.trim());
    }
    
    return parts.join(', ');
  };

  // Helper function to update dropdown options based on selection
  const updateDropdownOptions = () => {
    if (selectedProvinsi) {
      // Filter kota based on selected provinsi
      const filteredKota: Record<string, string> = {};
      Object.entries(wilayahData.kota).forEach(([code, name]) => {
        if (code.startsWith(selectedProvinsi)) {
          filteredKota[code] = name;
        }
      });
      setAvailableKota(filteredKota);
      
      // Reset dependent dropdowns
      if (!selectedKota || !filteredKota[selectedKota]) {
        form.setValue('kota', '');
      }
    } else {
      setAvailableKota({});
      form.setValue('kota', '');
    }

    if (selectedKota) {
      // Filter kecamatan based on selected kota
      const filteredKecamatan: Record<string, string> = {};
      Object.entries(wilayahData.kecamatan).forEach(([code, name]) => {
        if (code.startsWith(selectedKota)) {
          filteredKecamatan[code] = name;
        }
      });
      setAvailableKecamatan(filteredKecamatan);
      
      // Reset dependent dropdowns
      if (!selectedKecamatan || !filteredKecamatan[selectedKecamatan]) {
        form.setValue('kecamatan', '');
      }
    } else {
      setAvailableKecamatan({});
      form.setValue('kecamatan', '');
    }

    if (selectedKecamatan) {
      // Filter kelurahan based on selected kecamatan
      const filteredKelurahan: Record<string, string> = {};
      Object.entries(wilayahData.kelurahan).forEach(([code, name]) => {
        if (code.startsWith(selectedKecamatan)) {
          filteredKelurahan[code] = name;
        }
      });
      setAvailableKelurahan(filteredKelurahan);
      
      // Reset dependent dropdown
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
      // Check address validity first
      const isValid = validateAddress(fullAddress);

      if (!isValid) {
        const info = {
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Invalid',
          confidence: 'invalid',
          isValid: false,
          validationError: 'Please select a valid address from the dropdown menus'
        };
        setDeliveryInfo(info);
        (window as any).__deliveryInfo = info;
        return;
      }

      // Address is valid, calculate delivery
      if (deliveryMethod) {
        const calculation = calculateDeliveryCost(fullAddress, deliveryMethod, cart, getTotalPrice());
        const info = {
          cost: calculation.cost,
          zone: calculation.zone.name,
          time: calculation.estimatedTime,
          formattedCost: formatDeliveryCost(calculation.cost),
          confidence: calculation.confidence,
          isValid: true
        };
        setDeliveryInfo(info);
        (window as any).__deliveryInfo = info;
      } else {
        const info = {
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
  }, [selectedProvinsi, selectedKota, selectedKecamatan, selectedKelurahan, detailedAddress, deliveryMethod, cart, getTotalPrice, paymentMethod]);

  // Timer effect for thank you modal
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showThankYouModal && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            // Timer finished, redirect to WhatsApp
            if (orderData) {
              const totalWithDelivery = orderTotal + (deliveryInfo?.cost || 0);
              const message = buildWhatsAppMessage(orderData, cart, totalWithDelivery, deliveryInfo?.cost || 0);
              sendWhatsAppOrder(message, WHATSAPP_NUMBER);
              setShowThankYouModal(false);
              setTimer(5);
              setOrderData(null);
              setOrderTotal(0);
              setDeliveryInfo(null);
              clearCart();
              form.reset();
              
              // Add page action after WhatsApp redirect
              setTimeout(() => {
                // Scroll to top of page
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Optionally reload the page after a short delay
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }, 1000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showThankYouModal, timer, orderData, orderTotal, deliveryInfo, form, cart]);

  const onSubmit = (data: OrderFormData) => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add products to cart first',
        variant: 'destructive',
      });
      return;
    }

    // Check if address is valid
    const fullAddress = generateFullAddress();
    if (!validateAddress(fullAddress)) {
      toast({
        title: 'Invalid Address',
        description: 'Please complete all address fields',
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
    // Close confirmation modal and show thank you modal
    setShowConfirmationModal(false);
    setShowThankYouModal(true);
    setTimer(5);
  };

  const handleEditOrder = () => {
    // Close confirmation modal to allow editing
    setShowConfirmationModal(false);
  };

  const { isValid, errors } = form.formState;

  // Count required fields that are completed
  const completedFields = [
    form.watch('name'),
    form.watch('phone'),
    form.watch('provinsi'),
    form.watch('kota'),
    form.watch('kecamatan'),
    form.watch('detailedAddress'),
    form.watch('deliveryMethod'),
    form.watch('paymentMethod'),
  ].filter(field => field && field.toString().trim() !== '').length;

  const totalRequiredFields = 8;

  return (
    <section id="order" className="mb-12 md:mb-16 py-16 order-form-texture rounded-3xl">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-2 border-[#a3e2f5]/30 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-[#edadc3]/10 border-b border-[#a3e2f5]/30">
            <CardTitle className="text-3xl font-bold text-[#11110a] flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-[#edadc3]" />
              Order Form
            </CardTitle>
            {/* Progress Indicator */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-[#11110a]/70 mb-2">
                <span>Form Progress</span>
                <span>{completedFields}/{totalRequiredFields} completed</span>
              </div>
              <div className="w-full bg-[#a3e2f5]/20 rounded-full h-2">
                <div
                  className="bg-[#edadc3] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedFields / totalRequiredFields) * 100}%` }}
                ></div>
              </div>
            </div>
            <CardDescription className="text-[#11110a]/70">
              {completedFields === totalRequiredFields
                ? 'Data kamu sudah lengkap, yuk di order sekarang!'
                : 'Mohon lengkapi data kamu dulu ya, kami akan menghubungi kamu lewat WhatsApp secepatnya.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#11110a] font-semibold">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f]"
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
                    <FormLabel className="text-[#11110a] font-semibold">
                      WhatsApp Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={15} // ✅ hard cap for typing
                        className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f]"
                        value={field.value}
                        onChange={(e) => {
                          // only digits
                          const onlyDigits = e.target.value.replace(/\D/g, '');
                          field.onChange(onlyDigits);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <p className="text-xs text-[#11110a]/60 mt-1">
                      Hanya nomor Indonesia (0 atau 62 di depan), tanpa spasi atau simbol.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

                {/* Structured Address Selection */}
                <div className="space-y-4">
                  <div className="text-[#11110a] font-semibold mb-2">📍 Complete Address</div>
                  
                  {/* Provinsi Dropdown */}
                  <FormField
                    control={form.control}
                    name="provinsi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provinsi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f]">
                              <SelectValue placeholder="Pilih Provinsi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(wilayahData.provinsi).map(([code, name]) => (
                              <SelectItem key={code} value={code}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Kota Dropdown */}
                  <FormField
                    control={form.control}
                    name="kota"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kota/Kabupaten</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedProvinsi}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f]">
                              <SelectValue placeholder="Pilih Kota/Kabupaten" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(availableKota).map(([code, name]) => (
                              <SelectItem key={code} value={code}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FormLabel>Kecamatan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedKota}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f]">
                              <SelectValue placeholder="Pilih Kecamatan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(availableKecamatan).map(([code, name]) => (
                              <SelectItem key={code} value={code}>{name}</SelectItem>
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
                        <FormLabel className="flex items-center gap-2">
                          Kelurahan
                          <span className="text-xs text-gray-500 font-normal">(Opsional)</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedKecamatan || Object.keys(availableKelurahan).length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className={`rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f] ${
                              !selectedKecamatan ? 'bg-gray-50' : ''
                            }`}>
                              <SelectValue placeholder={
                                !selectedKecamatan
                                  ? "Pilih kecamatan terlebih dahulu"
                                  : Object.keys(availableKelurahan).length > 0
                                  ? "Pilih kelurahan (Opsional)"
                                  : "Data kelurahan tidak tersedia"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(availableKelurahan).map(([code, name]) => (
                              <SelectItem key={code} value={code}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedKecamatan && Object.keys(availableKelurahan).length === 0 && (
                          <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                            ℹ️ Data kelurahan tidak tersedia untuk wilayah ini. Silakan isi detail alamat di bawah untuk lokasi yang lebih spesifik.
                          </p>
                        )}
                        {Object.keys(availableKelurahan).length > 0 && (
                          <p className="text-xs text-gray-500">
                            Tip: Pilih kelurahan untuk alamat yang lebih spesifik, atau kosongkan dan gunakan detail alamat di bawah.
                          </p>
                        )}
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
                        <FormLabel>Detail Alamat (Jalan, Nomor Rumah, dll)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Jl. Denpasar No. 123 RT 001 RW 002"
                            {...field}
                            className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f] min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    ℹ️ Note: Delivery costs shown are estimates. Final costs will be confirmed via WhatsApp.
                  </div>
                  
                  {/* Custom validation error for address */}
                  {deliveryInfo && !deliveryInfo.isValid && deliveryInfo.validationError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{deliveryInfo.validationError}</span>
                    </div>
                  )}
                </div>

              <FormField
                control={form.control}
                name="deliveryMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#11110a] font-semibold">
                      Delivery Method
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-[#a3e2f5]/30">
                          <SelectValue placeholder="Select delivery method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* ⬇️ value must match the enum string */}
                        <SelectItem value="gosend">GoSend Instant</SelectItem>
                        <SelectItem value="grab">Grab Express</SelectItem>
                        <SelectItem value="paxel">Paxel</SelectItem>
                        {/* if you use pickup later */}
                        {/* <SelectItem value="pickup">Self Pickup</SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

                {/* Delivery Cost Display */}
                {deliveryInfo && (
                  <Card className={`border-2 ${deliveryInfo.isValid ? 'bg-[#553d8f]/5 border-[#a3e2f5]/30' : 'bg-red-50 border-red-200'}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[#553d8f] font-semibold">
                          <Truck className="w-4 h-4" />
                          <span>Delivery Cost Calculator</span>
                        </div>

                        {!deliveryInfo.isValid ? (
                          <div className="text-red-600 text-sm">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>{deliveryInfo.validationError}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#edadc3]" />
                              <div>
                                <div className="font-medium text-[#11110a]">Zone</div>
                                <div className="text-[#11110a]/70">{deliveryInfo.zone}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4 text-[#edadc3]" />
                              <div>
                                <div className="font-medium text-[#11110a]">ETA</div>
                                <div className="text-[#11110a]/70">{deliveryInfo.time}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-[#edadc3]" />
                              <div>
                                <div className="font-medium text-[#11110a]">Cost</div>
                                <div className="font-semibold text-[#553d8f]">
                                  {deliveryInfo.formattedCost}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {deliveryInfo.confidence && deliveryInfo.isValid && (
                          <div className="text-xs text-[#11110a]/60 bg-[#a3e2f5]/20 px-3 py-2 rounded-lg">
                            ongkos kirim dan ETA hanya perkiraan
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#11110a] font-semibold">Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-[#a3e2f5]/30">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#11110a] font-semibold">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add special notes for your order"
                          {...field}
                          className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Order Summary */}
                {cart.length > 0 && deliveryInfo?.isValid && (
                  <Card className="bg-[#a3e2f5]/10 border-[#a3e2f5]/30">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-[#11110a] mb-3">Order Summary</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#11110a]/70">Products Subtotal</span>
                          <span className="text-[#11110a] font-medium">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#11110a]/70">Delivery Cost</span>
                          <span className="font-medium text-[#11110a]">
                            {deliveryInfo.formattedCost}
                          </span>
                        </div>
                        <div className="border-t border-[#a3e2f5]/30 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-[#11110a]">Total</span>
                            <span className="text-[#553d8f]">
                              Rp {(getTotalPrice() + deliveryInfo.cost).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Validation Summary */}
              {Object.keys(errors).length > 0 && cart.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>Kolom yang perlu dilengkapi:</span>
                  </div>
                  <div className="space-y-2 text-sm text-red-600">
                    {errors.name && <div>• Nama lengkap</div>}
                    {errors.phone && <div>• Nomor WhatsApp</div>}
                    {!selectedProvinsi && <div>• Provinsi</div>}
                    {!selectedKota && <div>• Kota/Kabupaten</div>}
                    {!selectedKecamatan && <div>• Kecamatan</div>}
                    {!detailedAddress?.trim() && <div>• Detail alamat</div>}
                    {!deliveryMethod && <div>• Metode pengiriman</div>}
                    {!paymentMethod && <div>• Metode pembayaran</div>}
                  </div>
                </div>
              )}

              {cart.length === 0 && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Keranjang kamu masih kosong, silakan pilih produk dulu ya 😊</span>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={!isValid || !deliveryInfo?.isValid || cart.length === 0}
                className={`w-full transition-all duration-300 rounded-xl py-6 text-lg font-semibold flex items-center justify-center gap-2 ${
                  isValid && deliveryInfo?.isValid && cart.length > 0
                    ? 'bg-[#edadc3] hover:bg-[#edadc3]/90 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                Order via WhatsApp
              </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showThankYouModal} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-lg bg-white border-2 border-[#a3e2f5]/30 rounded-3xl shadow-2xl p-0 overflow-hidden">
          <div className="bg-[#edadc3]/10 border-b-2 border-[#a3e2f5]/30 px-6 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-[#edadc3] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <DialogTitle className="text-xl font-bold text-[#11110a] mb-2">
              Terima kasih, {capitalizeName(customerName)}! 🧡
            </DialogTitle>

            <DialogDescription className="text-[#11110a]/70 text-sm">
              Pesanan kamu sudah kami terima. ✨
            </DialogDescription>
          </div>

          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <p className="text-[#11110a] text-sm leading-relaxed mb-4">
                Yay, terima kasih sudah memilih Tiny Bitty! Tim kami akan segera
                menghubungi kamu melalui WhatsApp untuk konfirmasi pesanan, alamat,
                dan detail pengiriman supaya semuanya aman dan rapi. 💌
              </p>

              {/* Countdown Timer */}
              <div className="bg-[#553d8f]/5 rounded-2xl p-3 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-[#553d8f]" />
                  <p className="text-[#553d8f] font-semibold text-base">
                    Mengarahkan ke WhatsApp dalam {timer} detik...
                  </p>
                </div>

                <div className="w-full bg-[#a3e2f5]/30 rounded-full h-2 mb-2">
                  <div
                    className="bg-[#edadc3] h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - timer) / 5) * 100}%` }}
                  ></div>
                </div>

                <p className="text-[#11110a]/60 text-xs">
                  Mohon tunggu sebentar ya, kami sedang menyiapkan pesan WhatsApp
                  khusus untuk pesananmu. 🍪
                </p>
              </div>

              <p className="text-[#11110a]/70 text-xs">
                Terima kasih sudah mempercayai Tiny Bitty untuk menemani hari-harimu! 💖
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-44 h-44 bg-[#553d8f]/5 rounded-3xl flex items-center justify-center border-2 border-[#a3e2f5]/30">
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
            border-2 border-[#a3e2f5]/30
            rounded-3xl
            shadow-2xl
            p-0
            overflow-hidden
            max-h-[80vh]       /* ⬅️ cap height */
            flex flex-col      /* ⬅️ header + scrollable body */
          "
        >
          {/* Header (fixed) */}
          <div className="bg-[#553d8f]/10 border-b-2 border-[#a3e2f5]/30 px-6 py-6 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#11110a] flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-[#553d8f]" />
                Review Your Order
              </DialogTitle>
              <DialogDescription className="text-[#11110a]/70">
                Please review your order details before we proceed
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body (scrollable) */}
          <div className="px-6 py-6 overflow-y-auto flex-1">
            {orderData && (
              <div className="space-y-4">
                {/* Customer Details */}
                <div className="bg-[#a3e2f5]/10 rounded-2xl p-4">
                  <h3 className="font-semibold text-[#11110a] mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#553d8f]" />
                    Customer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#11110a]/70">Name:</span>
                      <div className="font-medium text-[#11110a]">{orderData.name}</div>
                    </div>
                    <div>
                      <span className="text-[#11110a]/70">WhatsApp:</span>
                      <div className="font-medium text-[#11110a]">{orderData.phone}</div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[#11110a]/70">Address:</span>
                      <div className="font-medium text-[#11110a]">{orderData.address}</div>
                    </div>
                    <div>
                      <span className="text-[#11110a]/70">Delivery:</span>
                      <div className="font-medium text-[#11110a]">
                        {deliveryMethod === 'gosend' && 'GoSend Instant'}
                        {deliveryMethod === 'grab' && 'Grab Express'}
                        {deliveryMethod === 'paxel' && 'Paxel'}
                        {deliveryMethod === 'pickup' && 'Self Pickup'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#11110a]/70">Payment:</span>
                      <div className="font-medium text-[#11110a]">Bank Transfer</div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl border-2 border-[#a3e2f5]/30 p-4">
                  <h3 className="font-semibold text-[#11110a] mb-3 flex items-center gap-2">
                    🛒 Order Items ({cart.length} items)
                  </h3>
                  {/* you can remove the inner max-h if you want outer scroll only */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={`${item.productId}-${item.variant.size}`}
                        className="flex items-center gap-3 p-3 bg-[#f5fbf8] rounded-xl"
                      >
                        <div
                          className="w-12 h-12 bg-cover bg-center bg-no-repeat rounded-xl flex-shrink-0"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#11110a] text-sm truncate">{item.productName}</h4>
                          <p className="text-xs text-[#11110a]/70">{item.variant.size}</p>
                          <p className="text-xs text-[#553d8f] font-medium">
                            {item.quantity}x Rp {item.variant.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#11110a]">
                            Rp {(item.variant.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                {deliveryInfo && deliveryInfo.isValid && (
                  <div className="bg-[#553d8f]/5 rounded-2xl p-4">
                    <h3 className="font-semibold text-[#11110a] mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#11110a]/70">Products Subtotal</span>
                        <span className="text-[#11110a]">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#11110a]/70">Delivery Cost</span>
                        <span className="text-[#11110a]">Rp {deliveryInfo.cost.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="border-t border-[#a3e2f5]/30 pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-[#11110a]">Total</span>
                          <span className="text-[#553d8f]">
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
                    className="flex-1 border-2 border-[#a3e2f5] text-[#11110a] hover:bg-[#a3e2f5]/10 py-3 rounded-xl font-medium"
                  >
                    Edit Order
                  </Button>
                  <Button
                    onClick={handleConfirmOrder}
                    className="flex-1 bg-[#f9c2cd] hover:bg-[#f9c2cd]/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Confirm & Continue
                  </Button>
                </div>

                {orderData.notes && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                    <h4 className="font-medium text-[#11110a] mb-2">📝 Special Notes</h4>
                    <p className="text-sm text-[#11110a]/80">{orderData.notes}</p>
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
