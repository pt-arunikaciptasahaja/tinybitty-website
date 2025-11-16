import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface CartSheetProps {
  children?: React.ReactNode;
}

export default function CartSheet({ children }: CartSheetProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const checkFormFilled = (): boolean => {
    const formSection = document.getElementById('order');
    if (!formSection) return false;

    const form = formSection.querySelector('form');
    if (!form) return false;

    // Check text inputs for new structured form
    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
    const phoneInput = form.querySelector<HTMLInputElement>('input[name="phone"]');
    const detailedAddressTextarea = form.querySelector<HTMLTextAreaElement>('textarea[name="detailedAddress"]');

    const name = nameInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    const detailedAddress = detailedAddressTextarea?.value.trim() || '';

    // Check selects - find all Select triggers for structured address + delivery + payment
    const selectTriggers = form.querySelectorAll('button[role="combobox"]');
    
    // Get text from SelectValue or from trigger (excluding placeholder)
    const getSelectValue = (trigger: Element): string => {
      // Try to find SelectValue component first
      const selectValue = trigger.querySelector('[data-radix-select-value]');
      if (selectValue) {
        return selectValue.textContent?.trim() || '';
      }
      // Fallback to trigger text, but exclude placeholder
      const text = trigger.textContent?.trim() || '';
      if (text.includes('Select') || text.includes('Pilih')) {
        return '';
      }
      return text;
    };

    // Map select values: provinsi, kota, kecamatan, kelurahan, deliveryMethod, paymentMethod
    const provinsiValue = selectTriggers[0] ? getSelectValue(selectTriggers[0]) : '';
    const kotaValue = selectTriggers[1] ? getSelectValue(selectTriggers[1]) : '';
    const kecamatanValue = selectTriggers[2] ? getSelectValue(selectTriggers[2]) : '';
    const kelurahanValue = selectTriggers[3] ? getSelectValue(selectTriggers[3]) : ''; // Optional
    const deliveryValue = selectTriggers[4] ? getSelectValue(selectTriggers[4]) : '';
    const paymentValue = selectTriggers[5] ? getSelectValue(selectTriggers[5]) : '';

    return name.length >= 2 &&
           phone.length >= 10 &&
           provinsiValue.length > 0 &&
           kotaValue.length > 0 &&
           kecamatanValue.length > 0 &&
           detailedAddress.length >= 10 &&
           deliveryValue.length > 0 &&
           paymentValue.length > 0;
  };

  const scrollToOrderForm = () => {
    const isFormFilled = checkFormFilled();
    
    // Always close the cart sheet first
    setOpen(false);
    
    // Show warning toast if form is incomplete
    if (!isFormFilled) {
      toast({
        title: 'Form incomplete',
        description: 'Please complete all order data first',
        variant: 'destructive',
      });
    }

    // Scroll to form after closing modal
    setTimeout(() => {
      const orderSection = document.getElementById('order');
      if (orderSection) {
        orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight empty fields after a short delay
        if (!isFormFilled) {
          setTimeout(() => {
            const form = orderSection.querySelector('form');
            if (form) {
              const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
              const phoneInput = form.querySelector<HTMLInputElement>('input[name="phone"]');
              const detailedAddressTextarea = form.querySelector<HTMLTextAreaElement>('textarea[name="detailedAddress"]');
              const selectTriggers = form.querySelectorAll<HTMLButtonElement>('button[role="combobox"]');
              
              // Focus and highlight first empty input
              let focused = false;
              [nameInput, phoneInput, detailedAddressTextarea].forEach((input) => {
                if (input && !input.value.trim()) {
                  if (!focused) {
                    input.focus();
                    focused = true;
                  }
                  input.classList.add('ring-2', 'ring-red-500');
                  setTimeout(() => {
                    input.classList.remove('ring-2', 'ring-red-500');
                  }, 2000);
                }
              });

              // Highlight empty selects (provinsi, kota, kecamatan, kelurahan, delivery, payment)
              selectTriggers.forEach((trigger, index) => {
                const text = trigger.textContent?.trim() || '';
                // Highlight required selects: provinsi(0), kota(1), kecamatan(2), delivery(4), payment(5)
                if (text.includes('Select') || text.includes('Pilih')) {
                  // Skip kelurahan(3) as it's optional
                  if (index !== 3) {
                    trigger.classList.add('ring-2', 'ring-red-500', 'border-red-500');
                    setTimeout(() => {
                      trigger.classList.remove('ring-2', 'ring-red-500', 'border-red-500');
                    }, 2000);
                  }
                }
              });
            }
          }, 500);
        }
      }
    }, 100);
  };

  const handleStartShopping = () => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // If children are provided, wrap them in a SheetTrigger
  const triggerContent = children || (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 z-40 bg-[#f9c2cd] hover:bg-[#f9c2cd]/90 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-6 py-6 flex items-center gap-2"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="font-semibold">Cart</span>
      {getTotalItems() > 0 && (
        <Badge className="bg-white text-[#f9c2cd] ml-1">{getTotalItems()}</Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {triggerContent}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-[#ffeef1] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-800">Review Your Order</SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? 'Your cart is still empty'
              : `Check ${getTotalItems()} items before proceeding to order`}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No products in cart yet</p>
            <Button
              onClick={handleStartShopping}
              className="bg-[#f9c2cd] hover:bg-[#f9c2cd]/90 text-white rounded-xl"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.variant.size}`}
                      className="bg-white rounded-2xl p-4 shadow-md border border-[#f9c2cd]/20"
                    >
                      <div className="flex gap-4">
                        {/* Product image container - matching product card style */}
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-20 h-20 bg-cover bg-center bg-no-repeat rounded-xl"
                            style={{ backgroundImage: `url(${item.image})` }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{item.productName}</h4>
                          <p className="text-sm text-gray-600">{item.variant.size}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <p className="text-xs text-gray-500">Unit price</p>
                              <p className="text-sm font-semibold text-[#f9c2cd]">
                                Rp {item.variant.price.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Subtotal</p>
                              <p className="text-sm font-bold text-gray-800">
                                Rp {(item.variant.price * item.quantity).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f9c2cd]/20">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, item.variant.size, item.quantity - 1)}
                            className="h-8 w-8 rounded-full border-[#f9c2cd]/30 hover:bg-[#f9c2cd]/10"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-10 text-center font-semibold text-gray-800">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, item.variant.size, item.quantity + 1)}
                            className="h-8 w-8 rounded-full border-[#f9c2cd]/30 hover:bg-[#f9c2cd]/10"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.productId, item.variant.size)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="border-t-2 border-[#f9c2cd]/30 bg-[#ffeef1] p-6 -mx-6 mt-auto">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-semibold text-gray-800">{getTotalItems()} item</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">Subtotal</span>
                  <span className="text-2xl font-bold text-[#f9c2cd]">
                    Rp {getTotalPrice().toLocaleString('id-ID')}
                  </span>
                </div>
                {/* Show estimated total with delivery if form has valid address */}
                {(() => {
                  // Try to get delivery cost from OrderForm
                  const deliveryInfo = (window as any).__deliveryInfo;
                  if (deliveryInfo && deliveryInfo.isValid && deliveryInfo.cost > 0) {
                    const total = getTotalPrice() + deliveryInfo.cost;
                    return (
                      <div className="mt-2 p-3 bg-white/70 rounded-xl border border-[#f9c2cd]/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Products Subtotal</span>
                          <span className="text-gray-800">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Estimated Delivery ({deliveryInfo.zone})</span>
                          <span className="text-gray-800">Rp {deliveryInfo.cost.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#f9c2cd]/20 pt-2 mt-2">
                          <span className="font-semibold text-gray-800">Estimated Total</span>
                          <span className="font-bold text-[#f9c2cd]">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">*Final cost will be confirmed via WhatsApp</p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <Button
                onClick={scrollToOrderForm}
                className="w-full bg-[#f9c2cd] hover:bg-[#f9c2cd]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-lg font-semibold"
              >
                Continue to Order
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
