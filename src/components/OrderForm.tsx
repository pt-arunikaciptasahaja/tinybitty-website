import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFormSchema } from '@/lib/validation';
import { OrderFormData } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { buildWhatsAppMessage, sendWhatsAppOrder } from '@/lib/whatsapp';
import { calculateDeliveryCost, formatDeliveryCost, getDeliveryInfo, validateAddress } from '@/lib/deliveryCalculator';
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
  const [timer, setTimer] = useState(3);
  const [orderData, setOrderData] = useState<OrderFormData | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      deliveryMethod: undefined,
      paymentMethod: undefined,
      notes: '',
    },
  });

  // Watch for changes in address and delivery method to calculate delivery cost
  const address = form.watch('address');
  const deliveryMethod = form.watch('deliveryMethod');
  const paymentMethod = form.watch('paymentMethod');

  // Calculate delivery cost when address or delivery method changes
  useEffect(() => {
    if (address && address.trim().length >= 3) {
      // Check address validity first
      const isValid = validateAddress(address);

      if (!isValid) {
        setDeliveryInfo({
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Invalid',
          confidence: 'invalid',
          isValid: false,
          validationError: 'Please enter a valid city or area name (e.g., Jakarta, Depok, Bogor)'
        });
        return;
      }

      // Address is valid, calculate delivery
      if (deliveryMethod) {
        const calculation = calculateDeliveryCost(address, deliveryMethod, cart, getTotalPrice());
        setDeliveryInfo({
          cost: calculation.cost,
          zone: calculation.zone.name,
          time: calculation.estimatedTime,
          formattedCost: formatDeliveryCost(calculation.cost),
          confidence: calculation.confidence,
          isValid: true
        });
      } else {
        setDeliveryInfo({
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Select delivery method',
          confidence: 'invalid',
          isValid: false,
          validationError: 'Please select a delivery method'
        });
      }
    } else {
      setDeliveryInfo(null);
    }
  }, [address, deliveryMethod, cart, getTotalPrice, paymentMethod]);

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
              setTimer(3);
              setOrderData(null);
              setOrderTotal(0);
              setDeliveryInfo(null);
              clearCart();
              form.reset();
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
    if (!validateAddress(data.address)) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid city or area name (e.g., Jakarta, Depok, Bogor)',
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

    // Show thank you modal and start timer
    setShowThankYouModal(true);
    setTimer(3);
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    const values = form.getValues();
    return (
      cart.length > 0 &&
      values.name?.trim().length >= 2 &&
      values.phone?.trim().length >= 10 &&
      values.address?.trim().length >= 10 &&
      deliveryMethod &&
      paymentMethod &&
      deliveryInfo?.isValid
    );
  };

  return (
    <section id="order" className="py-16 order-form-texture rounded-3xl">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-2 border-[#a3e2f5]/30 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-[#edadc3]/10 border-b border-[#a3e2f5]/30">
            <CardTitle className="text-3xl font-bold text-[#11110a] flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-[#edadc3]" />
              Order Form
            </CardTitle>
            <CardDescription className="text-[#11110a]/70">
              Fill in your details and we will contact you via WhatsApp
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
                      <FormLabel className="text-[#11110a] font-semibold">WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="08123456789"
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#11110a] font-semibold">Full Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Street 123, Jakarta, Indonesia"
                          {...field}
                          className="rounded-xl border-[#a3e2f5]/30 focus:border-[#553d8f] min-h-[100px]"
                        />
                      </FormControl>
                      <div className="text-xs text-[#11110a]/60 mt-1">
                        💡 Tip: Include your city/area (e.g., Jakarta, Depok, Bogor, Tangerang)
                      </div>
                      <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mt-2">
                        ℹ️ Note: Delivery costs shown are estimates. Final costs will be confirmed via WhatsApp.
                      </div>
                      <FormMessage />
                      {/* Custom validation error for address */}
                      {deliveryInfo && !deliveryInfo.isValid && deliveryInfo.validationError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{deliveryInfo.validationError}</span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#11110a] font-semibold">Delivery Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-[#a3e2f5]/30">
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gosendInstant">GoSend Instant</SelectItem>
                          <SelectItem value="grab">Grab Express</SelectItem>
                          <SelectItem value="paxel">Paxel</SelectItem>
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

                <Button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`w-full transition-all duration-300 rounded-xl py-6 text-lg font-semibold flex items-center justify-center gap-2 ${isFormValid()
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
              Pesanan manis kamu sudah kami terima. ✨
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
                    style={{ width: `${((3 - timer) / 3) * 100}%` }}
                  ></div>
                </div>

                <p className="text-[#11110a]/60 text-xs">
                  Mohon tunggu sebentar ya, kami sedang menyiapkan pesan WhatsApp
                  khusus untuk pesananmu. 🍪
                </p>
              </div>

              <p className="text-[#11110a]/70 text-xs">
                Terima kasih sudah mempercayai Tiny Bitty untuk menemani hari manismu! 💖
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
    </section>
  );
}