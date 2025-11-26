import jsPDF from 'jspdf';
import { CartItem, OrderFormData } from '@/types/product';

// Informasi bisnis
const BUSINESS_INFO = {
  name: 'Tiny Bitty',
  owner: 'Luckyta Aryandini',
  bankAccount: 'BCA 128-145-8294',
  whatsapp: '08111-2010-160',
  email: 'tinybitty.tb@gmail.com',
  instagram: 'instagram.com/tiny.bitty',
  address: 'Jakarta, Indonesia'
};

// Fungsi bantuan untuk memformat mata uang
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Fungsi bantuan untuk memformat tanggal
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Fungsi bantuan untuk menghasilkan nomor faktur
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getTime()).slice(-4);
  return `TB-${year}${month}${day}-${time}`;
};

export const generateInvoicePDF = (
  orderData: OrderFormData,
  cart: CartItem[],
  totalPrice: number,
  deliveryCost: number = 0,
  deliveryMethod?: string
): jsPDF => {
  // Create optimized PDF with compression
  const doc = new jsPDF({
    compress: true,
    putOnlyUsedFonts: true,
    orientation: 'portrait'
  });
  
  // Set document properties for smaller file size
  doc.setProperties({
    title: `Invoice - ${generateInvoiceNumber()}`,
    subject: 'Invoice',
    author: BUSINESS_INFO.name,
    keywords: 'invoice, tiny bitty',
    creator: 'Tiny Bitty Invoice Generator'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Warna
  const primaryColor = [93, 78, 142]; // #5D4E8E
  const secondaryColor = [191, 170, 227]; // #BFAAE3
  const textColor = [51, 51, 51]; // #333333
  const lightGray = [156, 152, 180]; // #9C98B4

  // Header - Logo bulat saja (highly optimized)
  const logoSize = 20; // Smaller logo size
  const logoUrl = 'https://res.cloudinary.com/dodmwwp1w/image/upload/c_limit,w_50,h_50,q_10,e_imagemin/v1763574652/logo-purple_dlshle.png';
  
  // Tambahkan logo bulat
  try {
    // Buat mask untuk logo bulat
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + logoSize/2, yPosition + logoSize/2, logoSize/2, 'F');
    
    // Tambahkan logo dengan optimasi
    doc.addImage(logoUrl, 'PNG', margin, yPosition, logoSize, logoSize, undefined, 'FAST');
    
    yPosition += logoSize + 15;
  } catch (error) {
    // Fallback jika logo gagal - gunakan teks saja untuk mengurangi ukuran
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(BUSINESS_INFO.name.substring(0, 10), margin, yPosition + 15);
    yPosition += 25;
  }
  
  // Nomor faktur (sejajar dengan Kepada)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Invoice #${generateInvoiceNumber()}`, pageWidth / 2 + margin, yPosition - 5);
  
  yPosition += 10;

  // Informasi Bisnis (kiri)
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Dari:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 5;
  doc.text(`Tiny Bitty`, margin, yPosition);
  yPosition += 4;
  doc.text(`WhatsApp: ${BUSINESS_INFO.whatsapp}`, margin, yPosition);
  yPosition += 4;
  doc.text(`IG: ${BUSINESS_INFO.instagram}`, margin, yPosition);

  // Informasi Pelanggan (kanan)
  const customerInfoY = yPosition - 12; // Sejajar dengan "Dari"
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Kepada Yth:', pageWidth / 2 + margin, customerInfoY);
  doc.setFont('helvetica', 'normal');
  yPosition = customerInfoY + 5;
  doc.text(orderData.name, pageWidth / 2 + margin, yPosition);
  yPosition += 4;
  doc.text(`WhatsApp: ${orderData.phone}`, pageWidth / 2 + margin, yPosition);
  
  // Alamat (tangani alamat panjang)
  const fullAddress = `${orderData.detailedAddress || ''} ${orderData.address ? ', ' + orderData.address : ''}`;
  const addressLines = doc.splitTextToSize(fullAddress.trim(), pageWidth / 2 - margin - 10);
  addressLines.forEach((line: string, index: number) => {
    if (index < 3) { // Batasi 3 baris
      yPosition = customerInfoY + 5 + (index + 2) * 4;
      doc.text(line, pageWidth / 2 + margin, yPosition);
    }
  });

  yPosition += 25;

  // Tanggal dibuat - sejajar dengan Kepada
  doc.setFontSize(9);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text(`Dibuat otomatis: ${formatDate(new Date())}`, pageWidth / 2 + margin, yPosition - 15);

  yPosition += 10;

  // Garis pemisah
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Header Tabel Item
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  const itemColWidth = pageWidth - 2 * margin;
  const nameColWidth = itemColWidth * 0.45;
  const qtyColWidth = itemColWidth * 0.10;
  const priceColWidth = itemColWidth * 0.15;
  const totalColWidth = itemColWidth * 0.15;
  
  doc.text('Produk', margin + 2, yPosition);
  doc.text('Jumlah', margin + nameColWidth + 5, yPosition);
  doc.text('Harga', margin + nameColWidth + qtyColWidth + 10, yPosition);
  doc.text('Total', margin + nameColWidth + qtyColWidth + priceColWidth + 15, yPosition);
  
  yPosition += 3;
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Item
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  cart.forEach((item) => {
    const itemTotal = item.variant.price * item.quantity;
    
    // Nama item dengan ukuran
    const itemName = `${item.productName}${item.variant.size ? ` (${item.variant.size})` : ''}`;
    const nameLines = doc.splitTextToSize(itemName, nameColWidth - 4);
    const itemHeight = Math.max(nameLines.length * 4, 6);
    
    // Render item name (with potential multiple lines)
    nameLines.forEach((line: string, lineIndex: number) => {
      const lineY = yPosition + (lineIndex * 4);
      doc.text(line, margin + 2, lineY);
    });
    
    // Render quantity (centered vertically)
    const qtyY = yPosition + (itemHeight / 2) + 1;
    doc.text(item.quantity.toString(), margin + nameColWidth + 5, qtyY);
    
    // Render price (centered vertically)
    const priceY = yPosition + (itemHeight / 2) + 1;
    doc.text(formatCurrency(item.variant.price), margin + nameColWidth + qtyColWidth + 10, priceY);
    
    // Render total (centered vertically)
    const totalY = yPosition + (itemHeight / 2) + 1;
    doc.text(formatCurrency(itemTotal), margin + nameColWidth + qtyColWidth + priceColWidth + 15, totalY);
    
    yPosition += itemHeight + 2; // Add small gap between items
  });

  yPosition += 10;

  // Total
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 80, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Subtotal
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - margin - 80, yPosition);
  doc.text(formatCurrency(totalPrice), pageWidth - margin - 10, yPosition, { align: 'right' });
  yPosition += 6;

  // Pengiriman
  if (deliveryCost > 0) {
    doc.text('Pengiriman:', pageWidth - margin - 80, yPosition);
    doc.text(formatCurrency(deliveryCost), pageWidth - margin - 10, yPosition, { align: 'right' });
    yPosition += 6;
    
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.line(pageWidth - margin - 80, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;
  }

  // Total Keseluruhan
  const grandTotal = totalPrice + deliveryCost;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Total:', pageWidth - margin - 80, yPosition);
  doc.text(formatCurrency(grandTotal), pageWidth - margin - 10, yPosition, { align: 'right' });

  yPosition += 15;

  // Informasi Pengiriman
  if (deliveryMethod) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`Metode Pengiriman: ${deliveryMethod}`, margin, yPosition);
    yPosition += 5;
  }

  // Informasi Pembayaran
  yPosition += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Pembayaran:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Rekening: ${BUSINESS_INFO.bankAccount}`, margin, yPosition);
  yPosition += 4;
  doc.text(`Nama Rekening: ${BUSINESS_INFO.owner}`, margin, yPosition);

  // Catatan
  if (orderData.notes) {
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Catatan:', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(orderData.notes, pageWidth - 2 * margin - 10);
    doc.text(notesLines, margin, yPosition);
    yPosition += notesLines.length * 4 + 5;
  }

  // Footer
  yPosition = pageHeight - 30;
  doc.setFontSize(9);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Terima kasih telah memilih Tiny Bitty!', margin, yPosition);
  doc.text('Untuk pertanyaan, silakan hubungi kami melalui WhatsApp', margin, yPosition + 4);

  return doc;
};

export const downloadInvoicePDF = (
  orderData: OrderFormData,
  cart: CartItem[],
  totalPrice: number,
  deliveryCost: number = 0,
  deliveryMethod?: string
): void => {
  const doc = generateInvoicePDF(orderData, cart, totalPrice, deliveryCost, deliveryMethod);
  const invoiceNumber = `TB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getTime()).slice(-4)}`;
  doc.save(`Faktur-${invoiceNumber}.pdf`);
};

export const getInvoiceBlob = (
  orderData: OrderFormData,
  cart: CartItem[],
  totalPrice: number,
  deliveryCost: number = 0,
  deliveryMethod?: string
): Blob => {
  const doc = generateInvoicePDF(orderData, cart, totalPrice, deliveryCost, deliveryMethod);
  // Use compressed output format
  return doc.output('blob', { compression: 'DEFLATE', compressionLevel: 9 });
};