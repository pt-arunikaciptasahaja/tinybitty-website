import { CartItem, OrderFormData } from '@/types/product';

export const buildWhatsAppMessage = (
  orderData: OrderFormData,
  cart: CartItem[],
  totalPrice: number,
  deliveryCost: number = 0,
  isDistanceTooFar: boolean = false,
  deliveryDistance: number | null = null
): string => {
  const deliveryMethodMap: Record<string, string> = {
    gosend: 'GoSend Instant',
    gosendsameday: 'GoSend Same Day',
    grab: 'GrabExpress Instant',
    grabsameday: 'GrabExpress Same Day',
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

  // Build address using the new search-based system (avoiding duplicates)
  const buildAddressFromData = (data: OrderFormData): string => {
    const parts: string[] = [];

    // Add detailed address first (street address, house number, etc.)
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

    // Add main address from search-based system (this already includes city/province)
    if (data.address) {
      parts.push(toCamelCase(data.address.trim()));
    }

    return parts.join(', ');
  };

  const grandTotal = totalPrice + (deliveryCost || 0);
  
  // Force Paxel display when distance > 40km for GoSend/Grab methods
  const deliveryLabel = (isDistanceTooFar && deliveryDistance && deliveryDistance > 40) 
    ? 'Paxel' 
    : (deliveryMethodMap[orderData.deliveryMethod] || orderData.deliveryMethod || '-');
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

  // Note when delivery cost calculation fails
  if (deliveryCost === 0 && orderData.deliveryMethod && orderData.deliveryMethod !== 'pickup') {
    message += `\n⚠️ Note: Gagal menghitung ongkir secara otomatis.\n`;
    message += `Biaya kirim akan dikonfirmasi melalui chat ini ya, Kak!\n`;
  }

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
