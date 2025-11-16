import { CartItem, OrderFormData } from '@/types/product';
import wilayahData from '@/data/jabodetabek-addresses.json';

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
  
  // Build structured address for WhatsApp message
  const buildAddressFromData = (data: OrderFormData): string => {
    const parts = [];
    
    if (data.provinsi && wilayahData.provinsi[data.provinsi]) {
      parts.push(wilayahData.provinsi[data.provinsi]);
    }
    
    if (data.kota && wilayahData.kota[data.kota]) {
      parts.push(wilayahData.kota[data.kota]);
    }
    
    if (data.kecamatan && wilayahData.kecamatan[data.kecamatan]) {
      parts.push(wilayahData.kecamatan[data.kecamatan]);
    }
    
    if (data.kelurahan && wilayahData.kelurahan[data.kelurahan]) {
      parts.push(wilayahData.kelurahan[data.kelurahan]);
    }
    
    if (data.detailedAddress) {
      parts.push(data.detailedAddress);
    }
    
    return parts.join(', ');
  };
  
  message += `* Alamat: ${buildAddressFromData(orderData)}\n\n`;

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

// Test WhatsApp URLs and functionality
export const testWhatsAppUrls = (phoneNumber: string) => {
  const testMessage = encodeURIComponent("Test message from Tiny Bitty");
  
  // Different URL formats to test
  const urls = {
    web: `https://wa.me/${phoneNumber}?text=${testMessage}`,
    webDirect: `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${testMessage}`,
    appBasic: `whatsapp://send?phone=${phoneNumber}`,
    appWithText: `whatsapp://send?phone=${phoneNumber}&text=${testMessage}`
  };
  
  console.log('Testing WhatsApp URLs:', urls);
  
  // Show testing dialog
  const testChoice = prompt(
    'WhatsApp Test Menu\n\n' +
    '1 = WhatsApp Web (https://wa.me)\n' +
    '2 = WhatsApp Web Direct\n' +
    '3 = WhatsApp Desktop (basic)\n' +
    '4 = WhatsApp Desktop (with text)\n\n' +
    'Enter number (1-4):'
  );
  
  switch (testChoice) {
    case '1':
      window.open(urls.web, '_blank');
      break;
    case '2':
      window.open(urls.webDirect, '_blank');
      break;
    case '3':
      window.open(urls.appBasic, '_blank');
      break;
    case '4':
      window.open(urls.appWithText, '_blank');
      break;
    default:
      console.log('No test selected');
  }
  
  return urls;
};

// Main WhatsApp order function - opens in new tab for all platforms
export const sendWhatsAppOrder = (message: string, phoneNumber: string) => {
  const encodedMessage = encodeURIComponent(message);
  
  // Use wa.me URL which works for mobile, web, and desktop apps
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  console.log('Opening WhatsApp in new tab:', whatsappUrl);
  
  // Open in new tab - works for all platforms
  const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  
  if (!newWindow) {
    // If popup was blocked, try alternative approach
    console.warn('Popup blocked, trying alternative method');
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Alternative direct approach for immediate user clicks
export const sendWhatsAppOrderDirect = (message: string, phoneNumber: string) => {
  const encodedMessage = encodeURIComponent(message);
  
  // Try multiple URL formats for better compatibility
  const urls = [
    `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
    `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`,
    `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`
  ];
  
  let opened = false;
  
  // Try each URL with a small delay
  urls.forEach((url, index) => {
    setTimeout(() => {
      if (!opened) {
        try {
          console.log(`Trying URL ${index + 1}:`, url);
          window.open(url, '_blank');
          opened = true;
        } catch (error) {
          console.warn(`URL ${index + 1} failed:`, error);
        }
      }
    }, index * 200);
  });
  
  // If none worked after 1 second, use direct navigation
  setTimeout(() => {
    if (!opened) {
      console.log('All popups failed, using direct navigation');
      window.location.href = urls[0];
    }
  }, 1000);
};

// Helper function to check if user is on desktop
export const isDesktop = () => {
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to get WhatsApp URLs for manual use
export const getWhatsAppUrls = (phoneNumber: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  
  return {
    web: `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
    webDirect: `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`,
    desktop: `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`,
    desktopBasic: `whatsapp://send?phone=${phoneNumber}`
  };
};

// Copy WhatsApp link to clipboard
export const copyWhatsAppLink = async (phoneNumber: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  try {
    await navigator.clipboard.writeText(whatsappUrl);
    return { success: true, url: whatsappUrl };
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return { success: false, url: whatsappUrl };
  }
};

// Show user-friendly WhatsApp options
export const showWhatsAppOptions = (message: string, phoneNumber: string, onComplete: () => void) => {
  const isDesktopUser = isDesktop();
  
  if (isDesktopUser) {
    // Desktop user - provide multiple options
    const choice = confirm(
      '📱 **Pilihan Buka WhatsApp (Desktop):**\n\n' +
      '1. **WhatsApp Web** (Buka di browser - paling stabil)\n' +
      '2. **WhatsApp Desktop** (Aplikasi di komputer)\n' +
      '3. **Salin Link** (Copy link untuk dibuka manual)\n\n' +
      'Klik **OK** untuk WhatsApp Web (recommended)\n' +
      'Klik **Cancel** untuk pilihan lain'
    );
    
    if (choice) {
      // Open WhatsApp Web
      sendWhatsAppOrder(message, phoneNumber);
      onComplete();
    } else {
      // Show alternative options
      const altChoice = confirm(
        'Pilih metode lain:\n\n' +
        '**OK** = Coba WhatsApp Desktop\n' +
        '**Cancel** = Salin link WhatsApp'
      );
      
      if (altChoice) {
        // Try desktop app
        const desktopUrl = `whatsapp://send?phone=${phoneNumber}`;
        try {
          window.open(desktopUrl, '_blank');
          onComplete();
        } catch (error) {
          console.warn('Desktop app failed:', error);
          // Fallback to web
          sendWhatsAppOrder(message, phoneNumber);
          onComplete();
        }
      } else {
        // Copy link to clipboard
        copyWhatsAppLink(phoneNumber, message).then(result => {
          if (result.success) {
            alert('✅ Link WhatsApp berhasil disalin!\n\nSilakan paste link ini untuk membuka WhatsApp dengan pesan pesanan Anda.');
          } else {
            alert(`📋 Link WhatsApp:\n\n${result.url}\n\nSilakan copy link ini secara manual.`);
          }
          onComplete();
        });
      }
    }
  } else {
    // Mobile/web user - direct approach
    sendWhatsAppOrder(message, phoneNumber);
    onComplete();
  }
};
