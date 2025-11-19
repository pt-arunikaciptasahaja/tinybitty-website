import { CartItem, OrderFormData } from '@/types/product';
import { kelurahanData } from '@/data/kelurahan-data';
import wilayahData from '@/data/jabodetabek-addresses.json';

export const buildWhatsAppMessage = (
  orderData: OrderFormData,
  cart: CartItem[],
  totalPrice: number,
  deliveryCost: number = 0
): string => {
  const deliveryMethodMap: Record<string, string> = {
    gosend: 'GoSend Instant',
    gosendsameday: 'GoSend Same Day',
    grab: 'GrabExpress Instant',
    paxel: 'Paxel',
    pickup: 'Ambil sendiri (pickup)',
  };

  const paymentMethodMap: Record<string, string> = {
    transfer: 'Transfer Bank',
  };

  const formatNumber = (value: number) =>
    value.toLocaleString('id-ID'); // 365.000

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

  // Bangun alamat dari kode wilayah dengan kecamatan dan kelurahan
  const buildAddressFromData = (data: OrderFormData): string => {
    const parts: string[] = [];

    // Add detailed address first with camelCase formatting
    if (data.detailedAddress) {
      parts.push(toCamelCase(data.detailedAddress));
    }

    // Add kelurahan explicitly if available - using kelurahan-data.js structure
    if (data.kota && data.kecamatan && data.kelurahan && kelurahanData[data.kota]?.[data.kecamatan]) {
      const kelurahanArray = kelurahanData[data.kota][data.kecamatan];
      const kelurahanIndex = parseInt(data.kelurahan);
      if (!isNaN(kelurahanIndex) && kelurahanArray[kelurahanIndex]) {
        parts.push(`Kel. ${toCamelCase(kelurahanArray[kelurahanIndex])}`);
      }
    }

    // Add kecamatan explicitly if available
    if (data.kecamatan) {
      parts.push(`Kec. ${toCamelCase(data.kecamatan)}`);
    }

    // Add kota/administrative area
    if (data.kota) {
      parts.push(toCamelCase(data.kota));
    }

    return parts.join(', ');
  };

  const grandTotal = totalPrice + (deliveryCost || 0);
  const deliveryLabel =
    deliveryMethodMap[orderData.deliveryMethod] || orderData.deliveryMethod || '-';
  const paymentLabel =
    paymentMethodMap[orderData.paymentMethod] || orderData.paymentMethod || '-';

  let message = '';

  // Header – cute Tiny Bitty
  message += `Hello, thank you for your order, @Tiny Bitty! 🧡\n\n`;

  // Data pelanggan
  message += `Nama : ${toCamelCase(orderData.name)}\n`;
  message += `Telp : ${orderData.phone}\n`;
  message += `Alamat :\n${buildAddressFromData(orderData)}\n\n`;

  // Items
  message += `Items + quantity:\n`;
  cart.forEach((item) => {
    const lineSubtotal = item.variant.price * item.quantity;
    const sizeLabel = item.variant.size ? ` (${item.variant.size})` : '';
    message += `${item.productName}${sizeLabel} ${formatNumber(
      item.variant.price
    )} x ${item.quantity} = ${formatNumber(lineSubtotal)}\n`;
  });

  message += `\n`;

  // Rangkuman total ala invoice
  message += `Total Produk : ${formatNumber(totalPrice)}\n`;

  if (deliveryCost > 0) {
    message += `Perkiraan Ongkir : ${formatNumber(deliveryCost)}\n`;
    message += `\nPerhitungan Total :\n`;
    message += `${formatNumber(totalPrice)} (produk) + ${formatNumber(deliveryCost)} (ongkir)\n`;
    message += `= Grand Total ${formatNumber(grandTotal)}\n\n`;
    message += `📝 *Note: Ongkir masih perkiraan ya, Kak! \n`;
    message += `Ongkir final mengikuti aplikasi GoSend/GrabExpress \n`;
    message += `(belum termasuk tol/parkir/tip)*\n`;
  } else {
    message += `\nTotal :\n`;
    message += `${formatNumber(totalPrice)}\n`;
    message += `= Grand Total ${formatNumber(totalPrice)}\n`;
  }

  message += `\nKirim via : ${deliveryLabel}\n`;
  message += `Metode pembayaran : ${paymentLabel}\n`;

  // Catatan khusus dari user
  if (orderData.notes) {
    message += `\nCatatan tambahan:\n${orderData.notes}\n`;
  }

  // Info pembayaran (static Tiny Bitty)
  message += `\nPlease transfer to:\n`;
  message += `Luckyta Aryandini\n`;
  message += `A/C BCA 1281458294\n\n`;

  // Cute brand closing
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
