import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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

  // -------------------------------
  // VALIDASI FORM (LOGIC SAMA)
  // -------------------------------
  const checkFormFilled = (): boolean => {
    const formSection = document.getElementById('order');
    if (!formSection) return false;

    const form = formSection.querySelector('form');
    if (!form) return false;

    const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
    const phoneInput = form.querySelector<HTMLInputElement>('input[name="phone"]');
    const detailedAddressTextarea =
      form.querySelector<HTMLTextAreaElement>('textarea[name="detailedAddress"]');

    const name = nameInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    const detailedAddress = detailedAddressTextarea?.value.trim() || '';

    const selectTriggers = form.querySelectorAll('button[role="combobox"]');

    const getSelectValue = (trigger: Element): string => {
      const selectValue = trigger.querySelector('[data-radix-select-value]');
      if (selectValue) return selectValue.textContent?.trim() || '';
      const text = trigger.textContent?.trim() || '';
      if (text.includes('Select') || text.includes('Pilih')) return '';
      return text;
    };

    const provinsiValue = selectTriggers[0] ? getSelectValue(selectTriggers[0]) : '';
    const kotaValue = selectTriggers[1] ? getSelectValue(selectTriggers[1]) : '';
    const kecamatanValue = selectTriggers[2] ? getSelectValue(selectTriggers[2]) : '';
    const kelurahanValue = selectTriggers[3] ? getSelectValue(selectTriggers[3]) : '';
    const deliveryValue = selectTriggers[4] ? getSelectValue(selectTriggers[4]) : '';
    const paymentValue = selectTriggers[5] ? getSelectValue(selectTriggers[5]) : '';

    return (
      name.length >= 2 &&
      phone.length >= 10 &&
      provinsiValue.length > 0 &&
      kotaValue.length > 0 &&
      kecamatanValue.length > 0 &&
      detailedAddress.length >= 10 &&
      deliveryValue.length > 0 &&
      paymentValue.length > 0
    );
  };

  // -------------------------------
  // SCROLL KE FORM PEMESANAN
  // -------------------------------
  const scrollToOrderForm = () => {
    const isFormFilled = checkFormFilled();

    setOpen(false);

    if (!isFormFilled) {
      toast({
        title: 'Data pesanan belum lengkap',
        description: 'Lengkapi dulu form pemesanan sebelum lanjut, ya.',
        variant: 'destructive',
      });
    }

    setTimeout(() => {
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleStartShopping = () => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Tombol trigger (floating cart button)
  const triggerContent = children || (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 z-40 bg-[#BFAAE3] hover:bg-[#A088D9] text-white shadow-2xl rounded-full px-6 py-6 flex items-center gap-2 transition-all"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="font-semibold">Keranjang</span>
      {getTotalItems() > 0 && (
        <Badge className="bg-white text-[#A088D9] ml-1">{getTotalItems()}</Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{triggerContent}</SheetTrigger>

      <SheetContent
        className="w-full sm:max-w-lg flex flex-col overflow-hidden"
        style={{
          backgroundColor: '#DFDBE5',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236b33c3\' fill-opacity=\'0.12\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-[#5D4E8E]">
            Ringkasan Keranjang
          </SheetTitle>
          <SheetDescription className="text-[#8978B4]">
            {cart.length === 0
              ? 'Keranjang belanja kamu masih kosong.'
              : `Cek dulu ${getTotalItems()} item sebelum lanjut isi data pesanan.`}
          </SheetDescription>
        </SheetHeader>

        {/* KERANJANG KOSONG */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingCart className="w-20 h-20 text-[#D8CFF7] mb-4" />
            <p className="text-[#8978B4] mb-4">Belum ada produk di keranjang.</p>
            <Button
              onClick={handleStartShopping}
              className="bg-[#BFAAE3] hover:bg-[#A088D9] text-white rounded-xl"
            >
              Lihat menu
            </Button>
          </div>
        ) : (
          <>
            {/* LIST ITEM KERANJANG (SCROLL) */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.variant.size}`}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-[#D8CFF7]/40"
                    >
                      <div className="flex gap-4">
                        <div
                          className="w-20 h-20 rounded-xl bg-cover bg-center shadow-sm"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#5D4E8E] truncate">
                            {item.productName}
                          </h4>
                          <p className="text-sm text-[#8E82AE]">{item.variant.size}</p>

                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <p className="text-xs text-[#8E82AE]">Harga satuan</p>
                              <p className="text-sm font-semibold text-[#A088D9]">
                                Rp {item.variant.price.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[#8E82AE]">Subtotal</p>
                              <p className="text-sm font-bold text-[#5D4E8E]">
                                Rp{' '}
                                {(item.variant.price * item.quantity).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* JUMLAH + HAPUS */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#D8CFF7]/40">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variant.size,
                                item.quantity - 1
                              )
                            }
                            className="h-8 w-8 rounded-full border-[#C8B6EA] text-[#7D69C3] hover:bg-[#EDE7F6]"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <span className="w-10 text-center font-semibold text-[#5D4E8E]">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variant.size,
                                item.quantity + 1
                              )
                            }
                            className="h-8 w-8 rounded-full border-[#C8B6EA] text-[#7D69C3] hover:bg-[#EDE7F6]"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeFromCart(item.productId, item.variant.size)
                          }
                          className="text-[#C06A87] hover:text-[#A85A75] hover:bg-[#F8E7EC]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* RINGKASAN BAWAH */}
            <div className="border-t-2 border-[#D8CFF7]/40 bg-[#F6F2FF] p-6 -mx-6 mt-auto">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8E82AE]">Total item</span>
                  <span className="font-semibold text-[#5D4E8E]">
                    {getTotalItems()} item
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#5D4E8E]">
                    Subtotal produk
                  </span>
                  <span className="text-2xl font-bold text-[#A088D9]">
                    Rp {getTotalPrice().toLocaleString('id-ID')}
                  </span>
                </div>

                {/* PERKIRAAN ONGKIR (JIKA ADA) */}
                {(() => {
                  const deliveryInfo = (window as any).__deliveryInfo;
                  if (deliveryInfo?.isValid && deliveryInfo.cost > 0) {
                    const total = getTotalPrice() + deliveryInfo.cost;
                    return (
                      <div className="mt-2 p-3 bg-white/70 rounded-xl border border-[#D8CFF7]/40 shadow-sm">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#8E82AE]">Subtotal produk</span>
                          <span className="text-[#5D4E8E]">
                            Rp {getTotalPrice().toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#8E82AE]">
                            Perkiraan ongkir ({deliveryInfo.zone})
                          </span>
                          <span className="text-[#5D4E8E]">
                            Rp {deliveryInfo.cost.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#D8CFF7]/40 pt-2 mt-2">
                          <span className="font-semibold text-[#5D4E8E]">
                            Perkiraan total
                          </span>
                          <span className="font-bold text-[#A088D9]">
                            Rp {total.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <p className="text-xs text-[#8E82AE] mt-1">
                          *Ongkir final akan dikonfirmasi lagi via WhatsApp.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <Button
                onClick={scrollToOrderForm}
                className="w-full bg-gradient-to-r from-[#C9B8EA] to-[#B39AD8] hover:from-[#BFAAE3] hover:to-[#A088D9] text-white shadow-lg rounded-xl py-6 text-lg font-semibold transition-all"
              >
                Lanjut ke form pemesanan
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
