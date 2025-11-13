import { CartItem, OrderFormData } from '@/types/product';

export const buildWhatsAppMessage = (
  orderData: OrderFormData,
  cart: CartItem[],
  totalPrice: number,
  deliveryCost: number = 0
): string => {
  const deliveryMethodMap = {
    gosendInstant: 'GoSend Instant',
    grab: 'Grab Express',
    paxel: 'Paxel',
  };

  const paymentMethodMap = {
    transfer: 'Transfer Bank',
  };

  let message = `***PESANAN BARU - Tiny Bitty***\n\n`;

  message += `**Data Pelanggan**\n`;
  message += `* Nama: ${orderData.name}\n`;
  message += `* No. HP: ${orderData.phone}\n`;
  message += `* Alamat: ${orderData.address}\n\n`;

  message += `**Detail Pesanan**\n`;
  cart.forEach((item, index) => {
    message += `\n${index + 1}. **${item.productName}**\n`;
    message += `   * ${item.variant.size} — ${item.quantity}x\n`;
    message += `   * Subtotal: Rp ${(item.variant.price * item.quantity).toLocaleString('id-ID')}\n`;
  });

  message += `\n**Rincian Pembayaran:**\n`;
  message += `* Subtotal Produk: Rp ${totalPrice.toLocaleString('id-ID')}\n`;
  message += `* Biaya Pengiriman: Rp ${deliveryCost.toLocaleString('id-ID')}\n`;
  message += `* **Total Keseluruhan: Rp ${(totalPrice + deliveryCost).toLocaleString('id-ID')}**\n\n`;

  message += `**Metode Pengiriman:** ${deliveryMethodMap[orderData.deliveryMethod]}\n`;
  message += `**Metode Pembayaran:** ${paymentMethodMap[orderData.paymentMethod]}\n`;
  
  if (orderData.notes) {
    message += `\n**Catatan Tambahan:**\n${orderData.notes}\n`;
  }

  message += `\n**Catatan:** Ongkir yang muncul masih perkiraan ya, Kak! Nanti kami cek dan infokan ulang ongkir terbaik sebelum order diproses.\n`;
  message += `\nTerima kasih sudah memesan di Tiny Bitty!`;

  return message;
};

export const sendWhatsAppOrder = (message: string, phoneNumber: string) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};
