import { CartItem, OrderFormData } from '@/types/product';
import { cleanAddress } from '@/lib/utils';

export const buildWhatsAppMessage = (
  orderData: OrderFormData,
  cart: CartItem[],
  totalPrice: number,
  deliveryCost: number = 0
): string => {
  const formatNumber = (value: number) => value.toLocaleString('id-ID');

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

  const buildAddressFromData = (data: OrderFormData): string => {
    const parts: string[] = [];

    if (data.detailedAddress) {
      const normalizedAddress = data.detailedAddress
        .trim()
        .replace(/\bjl\.?\b/gi, 'Jalan')
        .replace(/\bstreet\b/gi, 'Jalan')
        .replace(/\brt\.?\s*(\d+)/gi, 'RT $1')
        .replace(/\brw\.?\s*(\d+)/gi, 'RW $1')
        .replace(/\bno\.?\s*(\d+)/gi, 'No $1')
        .trim();
      parts.push(toCamelCase(normalizedAddress));
    }

    if (data.address) {
      parts.push(toCamelCase(cleanAddress(data.address.trim())));
    }

    return parts.join(', ');
  };

  const grandTotal = totalPrice + deliveryCost;

  let message = '';
  message += `Hello, thank you for your order, @Tiny Bitty! 🧡\n\n`;
  message += `Nama : ${toCamelCase(orderData.name)}\n`;
  message += `Telp : ${orderData.phone}\n`;
  message += `Alamat :\n${buildAddressFromData(orderData)}\n\n`;
  message += `Items + quantity:\n`;

  cart.forEach((item) => {
    const lineSubtotal = item.variant.price * item.quantity;
    const sizeLabel = item.variant.size ? ` (${item.variant.size})` : '';
    message += `${item.productName}${sizeLabel} ${formatNumber(item.variant.price)} x ${item.quantity} = ${formatNumber(lineSubtotal)}\n`;
  });

  message += `\nTotal Produk : ${formatNumber(totalPrice)}\n`;

  if (deliveryCost > 0) {
    message += `Biaya pengiriman : ${formatNumber(deliveryCost)}\n`;
    message += `\nPerhitungan Total :\n`;
    message += `${formatNumber(totalPrice)} (produk) + ${formatNumber(deliveryCost)} (ongkir)\n`;
    message += `= Grand Total ${formatNumber(grandTotal)}\n\n`;
  } else {
    message += `\nTotal :\n`;
    message += `${formatNumber(totalPrice)}\n`;
    message += `= Grand Total ${formatNumber(totalPrice)}\n`;
  }

  message += `\nMetode pengiriman : In-house delivery\n`;
  message += `Metode pembayaran : Transfer Bank\n`;

  if (orderData.notes) {
    message += `\nCatatan tambahan:\n${orderData.notes}\n`;
  }

  message += `\nPlease transfer to:\n`;
  message += `Luckyta Aryandini\n`;
  message += `A/C BCA 1281458294\n\n`;
  message += `Kalau ada yang mau diubah, silakan balas chat ini ya.\n`;
  message += `Terima kasih sudah memilih Tiny Bitty. Stay healthy! 🧁✨`;

  return message;
};

export const sendWhatsAppOrder = (message: string, phoneNumber: string): void => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  // Open WhatsApp in a new window/tab
  window.open(whatsappUrl, '_blank');
};
