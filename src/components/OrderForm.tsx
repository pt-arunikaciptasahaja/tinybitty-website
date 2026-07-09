import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFormSchema } from '@/lib/validation';
import { OrderFormData } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { buildWhatsAppMessage, sendWhatsAppOrder } from '@/lib/whatsapp';
import { fbPixelTrack } from '@/lib/fbpixel';
import { downloadInvoicePDF } from '@/lib/invoiceGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Lottie from 'lottie-react';
import remixAnimation from '@/data/Remix of assssa.json';
import AddressSearchInput from './AddressSearchInput';
import { DistanceResult } from '@/lib/nominatimClient';
import { MessageCircle, CheckCircle2, MapPin, MapPinHouse, Lightbulb, ShoppingBag, ClipboardCheck, PackageCheck, MessagesSquare, UserCheck, ReceiptText, UserRoundPen, Smartphone, NotebookPen, FileText, AlertCircle } from 'lucide-react';
import { cldThumb } from '@/lib/cdn';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281112010160';

const toCamelCase = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => {
      if (word.includes('.') || word.includes('-') || /^\d/.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export default function OrderForm() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const DELIVERY_FEE = 25000;

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
      notes: '',
    },
  });

  const address = form.watch('address');
  const detailedAddress = form.watch('detailedAddress');

  const handleAddressSelect = useCallback(
    (result: DistanceResult) => {
      form.setValue('address', result.destination.label);
      toast({
        title: 'Address found!',
        description: `${result.destination.label}`,
        variant: 'default',
      });
    },
    [form, toast]
  );

  const generateFullAddress = useCallback(() => {
    const addressField = form.getValues('address');
    const detailedAddressField = form.getValues('detailedAddress');
    const parts: string[] = [];

    if (detailedAddressField && detailedAddressField.trim()) {
      const normalizedAddress = detailedAddressField
        .trim()
        .replace(/\bjl\.?\b/gi, 'Jalan')
        .replace(/\bstreet\b/gi, 'Jalan')
        .replace(/\brt\.?\s*(\d+)/gi, 'RT $1')
        .replace(/\brw\.?\s*(\d+)/gi, 'RW $1')
        .replace(/\bno\.?\s*(\d+)/gi, 'No $1')
        .trim();
      parts.push(toCamelCase(normalizedAddress));
    }

    if (addressField && addressField.trim()) {
      parts.push(toCamelCase(addressField.trim()));
    }

    return parts.join(', ');
  }, [form]);

  const handleDownloadInvoice = async (): Promise<boolean> => {
    if (!orderData) return false;
    setIsGeneratingPDF(true);

    try {
      downloadInvoicePDF(orderData, cart, orderTotal, DELIVERY_FEE, 'In-house delivery');

      toast({
        title: 'Invoice downloaded!',
        description: 'Invoice has been downloaded to your device.',
      });

      return true;
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate invoice. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleWhatsAppRedirect = async () => {
    if (!orderData) return;

    const downloaded = await handleDownloadInvoice();
    if (!downloaded) return;

    const pixelData = {
      content_ids: cart.map((item) => item.productId),
      content_name: cart.map((item) => item.productName).join(', '),
      content_type: 'product',
      currency: 'IDR',
      value: orderTotal,
      customer_name: orderData.name,
      customer_phone: orderData.phone,
    };

    fbPixelTrack('Purchase', pixelData);

    const message = buildWhatsAppMessage(orderData, cart, orderTotal, DELIVERY_FEE);
    sendWhatsAppOrder(message, WHATSAPP_NUMBER);

    setShowThankYouModal(false);
    setOrderData(null);
    setOrderTotal(0);
    clearCart();
    form.reset();

    toast({
      title: 'WhatsApp opened!',
      description: 'Please send the message to complete your order.',
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
        description: 'Please add products to cart first.',
        variant: 'destructive',
      });
      return;
    }

    setOrderData(data);
    setCustomerName(data.name);
    setOrderTotal(getTotalPrice());

    fbPixelTrack('InitiateCheckout', {
      content_ids: cart.map((item) => item.productId),
      content_name: cart.map((item) => item.productName).join(', '),
      content_type: 'product',
      currency: 'IDR',
      value: getTotalPrice(),
      customer_name: data.name,
      customer_phone: data.phone,
    });

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
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const { errors } = form.formState;
  const isStep1Complete = form.watch('name')?.trim() !== '' && form.watch('phone')?.trim() !== '';
  const isStep2Complete = address?.trim().length >= 8 && detailedAddress?.trim().length >= 8;
  const currentStep = !isStep1Complete ? 1 : !isStep2Complete ? 2 : 3;
  const stepProgress = ((currentStep - 1) / 3) * 100;

  return (
    <section id="order" className="mb-8 md:mb-10 py-16 rounded-3xl bg-[#E9EDE2] border">
      <div className="container mx-auto px-2 sm:px-4 md:px-7 max-w-none">
        <Card className="rounded-3xl overflow-hidden w-full md:w-1/2 md:mx-auto">
          <CardHeader className="bg-muted/10">
            <CardTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-muted" />
              Your Order
            </CardTitle>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-secondary/70 mb-2">
                <span>Step {currentStep} of 3</span>
                <span>{currentStep === 3 ? 'Ready to confirm and order' : 'Complete the form to proceed'}</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-2">
                <div className="bg-muted h-2 rounded-full transition-all duration-300" style={{ width: `${stepProgress}%` }} />
              </div>
            </div>
            <CardDescription className="text-secondary/70">
              {currentStep === 1 && 'Add your name and WhatsApp number so we can confirm your order.'}
              {currentStep === 2 && 'Enter your full delivery address so we can deliver it safely.'}
              {currentStep === 3 && 'Review your order and send it via WhatsApp.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${currentStep === 1 ? 'bg-muted/5 border-muted' : isStep1Complete ? 'bg-green-50 border-green-200' : 'bg-muted/5 border-muted/40'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${isStep1Complete ? 'bg-green-500 text-white' : currentStep === 1 ? 'bg-muted text-white' : 'bg-gray-300 text-gray-600'}`}>
                      1
                    </div>
                    <h3 className="font-semibold text-secondary">Contact Details</h3>
                    {isStep1Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>

                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-secondary flex items-center gap-2">
                        <UserRoundPen className="w-4 h-4" />
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} className="rounded-xl text-secondary border-muted/40 focus:border-muted bg-white placeholder:text-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        WhatsApp number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="08123456789"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={15}
                          className="rounded-xl text-secondary border-muted/40 focus:border-muted bg-white placeholder:text-gray-400"
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
                      <p className="text-xs text-secondary/70 mt-1">Use an Indonesian number without spaces so WhatsApp connects smoothly.</p>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${currentStep === 2 ? 'bg-muted/5 border-muted' : isStep2Complete ? 'bg-green-50 border-green-200' : !isStep1Complete ? 'bg-gray-50 border-gray-200' : 'bg-muted/5 border-muted/40'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${isStep2Complete ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-muted text-white' : !isStep1Complete ? 'bg-gray-300 text-gray-500' : 'bg-muted/50 text-secondary'}`}>
                      2
                    </div>
                    <h3 className="font-semibold text-secondary">Delivery Address</h3>
                    {isStep2Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>

                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-secondary flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery address
                      </FormLabel>
                      <FormControl>
                        <AddressSearchInput
                          onSelect={handleAddressSelect}
                          disabled={!isStep1Complete}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="detailedAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary flex items-center gap-2">
                        <MapPinHouse className="w-4 h-4" />
                        Delivery details (required)
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Eg. Jl. Melati 12A, RT 001 RW 002"
                          {...field}
                          disabled={!isStep1Complete}
                          className="rounded-xl border-muted/40 focus:border-muted bg-white min-h-[80px] placeholder:text-gray-400"
                        />
                      </FormControl>
                      <p className="text-xs text-secondary/70 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Extra address details help the delivery team find you faster.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${currentStep === 3 ? 'bg-muted/5 border-muted' : isStep2Complete ? 'bg-green-50 border-green-200' : 'bg-muted/5 border-muted/40'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${isStep2Complete ? 'bg-green-500 text-white' : currentStep === 3 ? 'bg-muted text-white' : 'bg-gray-300 text-gray-500'}`}>
                      3
                    </div>
                    <h3 className="font-semibold text-secondary">Delivery Fee & Review</h3>
                    {isStep2Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>

                  <div className="bg-white rounded-2xl border border-muted/20 p-4 mb-6">
                    <div className="flex justify-between items-center gap-3 text-sm text-secondary/80">
                      <div>
                        <p className="font-medium">Fixed delivery fee</p>
                        <p className="text-xs text-secondary/70">In-house delivery, no shipping estimate needed.</p>
                      </div>
                      <p className="font-semibold text-secondary">Rp {DELIVERY_FEE.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary flex items-center gap-2">
                        <NotebookPen className="w-4 h-4" />
                        Additional notes (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special instructions? Write them here"
                          {...field}
                          className="rounded-xl border-muted/40 focus:border-primary bg-white placeholder:text-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {cart.length > 0 && (
                  <Card className="border-muted/40 bg-secondary/5">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="font-semibold text-secondary">Order summary</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary/70">Products subtotal</span>
                          <span className="text-secondary font-medium">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary/70">Delivery fee</span>
                          <span className="text-secondary font-medium">Rp {DELIVERY_FEE.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="border-t border-muted/20 pt-3 flex justify-between font-semibold text-secondary">
                          <span>Grand total</span>
                          <span>Rp {(getTotalPrice() + DELIVERY_FEE).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {Object.keys(errors).length > 0 && cart.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
                      <AlertCircle className="w-5 h-5" />
                      <span>Please complete the required fields below:</span>
                    </div>
                    <div className="space-y-2 text-sm text-red-600">
                      {errors.name && <div>• Full name</div>}
                      {errors.phone && <div>• WhatsApp number</div>}
                      {(!detailedAddress || detailedAddress.trim().length < 8) && <div>• Complete delivery address</div>}
                    </div>
                  </div>
                )}

                {cart.length === 0 && (
                  <div className="text-xs text-red-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>No products in your cart yet. Pick your favorites first!</span>
                    <button onClick={scrollToProducts} className="ml-auto flex items-center gap-1 bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 flex-shrink-0">
                      <ShoppingBag className="w-3 h-3" />
                      View menu
                    </button>
                  </div>
                )}

                <Button type="submit" disabled={!isStep2Complete || cart.length === 0} className={`relative w-full transition-all duration-300 rounded-full py-6 text-lg font-semibold flex items-center justify-center gap-2 overflow-hidden group ${isStep2Complete && cart.length > 0 ? 'bg-foreground text-white shadow-lg hover:shadow-primary/20' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {isStep2Complete && cart.length > 0 ? 'Order Now!' : 'Complete your address'}
                  </div>
                  {isStep2Complete && cart.length > 0 && <span className="absolute inset-0 z-0 bg-primary scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 origin-center" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showThankYouModal} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-lg bg-white border-2 border-muted/40 rounded-3xl shadow-2xl p-0 overflow-hidden">
          <div className="bg-secondary/5 border-b-2 border-muted/40 px-6 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <PackageCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-xl font-bold text-secondary mb-2">Thank you, {toCamelCase(customerName)}!</DialogTitle>
            <DialogDescription className="text-secondary/70 text-sm">We received your order details.</DialogDescription>
          </div>
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <p className="text-secondary text-sm leading-relaxed mb-4">Tiny Bitty will reach out on WhatsApp to confirm your order and delivery details.</p>
              <div className="bg-muted/10 rounded-2xl p-4 mb-4">
                <Button onClick={handleWhatsAppRedirect} disabled={isGeneratingPDF} className="relative w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-2 overflow-hidden group shadow-lg hover:shadow-[#25D366]/20 transition-all duration-300 disabled:opacity-70">
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <MessagesSquare className="w-5 h-5" />
                    {isGeneratingPDF ? 'Generating Invoice...' : 'Open WhatsApp'}
                  </div>
                  <span className="absolute inset-0 z-0 bg-white/20 scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 origin-center" />
                </Button>
                <p className="text-secondary/70 text-xs">Tap the WhatsApp button to confirm your order and save your invoice.</p>
              </div>
            </div>
            <div className="flex justify-center bg-muted/10 rounded-2xl">
              <div className="w-[340px] h-[200px] flex items-center justify-center">
                <Lottie animationData={remixAnimation} loop style={{ filter: 'hue-rotate(-95deg) saturate(1.4) brightness(1.25)' }} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="sm:max-w-2xl bg-white border-2 border-[#D8CFF7]/40 rounded-3xl shadow-2xl p-0 overflow-hidden max-h-[80vh] flex flex-col">
          <div className="bg-secondary/5 border-b-2 border-muted/40 px-6 py-6 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-secondary flex items-center gap-2">
                <ClipboardCheck className="w-8 h-8 text-primary" />
                Review your order
              </DialogTitle>
              <DialogDescription className="text-secondary/70">Please double-check the details below before sending them via WhatsApp.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 py-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#F6F2FF] [&::-webkit-scrollbar-thumb]:bg-[#D8CFF7] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#BFAAE3]">
            {orderData && (
              <div className="space-y-4">
                <div className="bg-secondary/5 rounded-2xl p-4">
                  <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Customer details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-secondary/70">Name:</span>
                      <div className="font-medium text-secondary">{toCamelCase(orderData.name)}</div>
                    </div>
                    <div>
                      <span className="text-secondary/70">WhatsApp number:</span>
                      <div className="font-medium text-secondary">{orderData.phone}</div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-secondary/70">Full address:</span>
                      <div className="font-medium text-secondary">{generateFullAddress()}</div>
                    </div>
                    <div>
                      <span className="text-[#8978B4]">Delivery fee:</span>
                      <div className="font-medium text-[#5D4E8E]">Rp {DELIVERY_FEE.toLocaleString('id-ID')}</div>
                    </div>
                    <div>
                      <span className="text-[#8978B4]">Payment method:</span>
                      <div className="font-medium text-[#5D4E8E]">Bank transfer</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-muted/40 p-4">
                  <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Ordered products ({cart.length} items)
                  </h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.productId}-${item.variant.size}`} className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
                        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-muted/10">
                          <img src={cldThumb(item.image, { width: 160, quality: 'auto:eco' })} alt={item.productName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary text-sm truncate">{item.productName}</h4>
                          <p className="text-xs text-secondary/70">{item.variant.size}</p>
                          <p className="text-xs text-primary font-medium">{item.quantity}x Rp {item.variant.price.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-secondary">Rp {(item.variant.price * item.quantity).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-4 bg-secondary/5">
                  <h3 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                    <ReceiptText className="w-5 h-5 text-primary" />
                    Payment summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary/70">Products subtotal</span>
                      <span className="text-secondary">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary/70">Delivery fee</span>
                      <span className="text-secondary">Rp {DELIVERY_FEE.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-t border-muted/20 pt-2 flex justify-between font-bold text-lg">
                      <span className="text-secondary">Grand total</span>
                      <span className="text-[#5D4E8E]">Rp {(getTotalPrice() + DELIVERY_FEE).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {orderData.notes && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                    <h4 className="font-medium text-secondary mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Additional notes
                    </h4>
                    <p className="text-sm text-secondary/70">{orderData.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleEditOrder} variant="outline" className="flex-1 border-2 border-muted/40 text-secondary hover:bg-secondary/5 py-3 rounded-xl font-medium">Edit order</Button>
                  <Button onClick={handleConfirmOrder} className="relative flex-1 bg-foreground text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 overflow-hidden group shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm
                    </div>
                    <span className="absolute inset-0 z-0 bg-primary scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 origin-center" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
