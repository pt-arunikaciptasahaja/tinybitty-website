import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

export default function CartSheet() {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const checkFormFilled = (): boolean => {
    const formSection = document.getElementById('order');
    if (!formSection) return false;

    const form = formSection.querySelector('form');
    if (!form) return false;

    // Check text inputs
    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
    const phoneInput = form.querySelector<HTMLInputElement>('input[name="phone"]');
    const addressTextarea = form.querySelector<HTMLTextAreaElement>('textarea[name="address"]');

    const name = nameInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    const address = addressTextarea?.value.trim() || '';

    // Check selects - find all Select triggers
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
      if (text.includes('Select delivery') || text.includes('Select payment')) {
        return '';
      }
      return text;
    };

    const deliveryValue = selectTriggers[0] ? getSelectValue(selectTriggers[0]) : '';
    const paymentValue = selectTriggers[1] ? getSelectValue(selectTriggers[1]) : '';

    return name.length >= 2 && 
           phone.length >= 10 && 
           address.length >= 10 && 
           deliveryValue.length > 0 && 
           paymentValue.length > 0;
  };

  const scrollToOrderForm = () => {
    const isFormFilled = checkFormFilled();
    
    if (!isFormFilled) {
      // Close the cart sheet
      setOpen(false);
      
      toast({
        title: 'Form incomplete',
        description: 'Please complete all order data first',
        variant: 'destructive',
      });
    }

    // Scroll to form regardless, but show warning if incomplete
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
              const addressTextarea = form.querySelector<HTMLTextAreaElement>('textarea[name="address"]');
              const selectTriggers = form.querySelectorAll<HTMLButtonElement>('button[role="combobox"]');
              
              // Focus and highlight first empty input
              let focused = false;
              [nameInput, phoneInput, addressTextarea].forEach((input) => {
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

              // Highlight empty selects
              selectTriggers.forEach((trigger) => {
                const text = trigger.textContent?.trim() || '';
                if (text.includes('Select delivery') || text.includes('Select payment')) {
                  trigger.classList.add('ring-2', 'ring-red-500', 'border-red-500');
                  setTimeout(() => {
                    trigger.classList.remove('ring-2', 'ring-red-500', 'border-red-500');
                  }, 2000);
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-[#ffeef1]">
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
            <ScrollArea className="h-[calc(100vh-280px)] mt-6">
              <div className="space-y-4">
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

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#ffeef1] border-t-2 border-[#f9c2cd]/30 shadow-lg">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-semibold text-gray-800">{getTotalItems()} item</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">Total Payment</span>
                  <span className="text-2xl font-bold text-[#f9c2cd]">
                    Rp {getTotalPrice().toLocaleString('id-ID')}
                  </span>
                </div>
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