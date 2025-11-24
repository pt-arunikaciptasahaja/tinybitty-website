import { z } from 'zod';

export const orderFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),

  phone: z
    .string()
    .nonempty('Nomor WhatsApp wajib diisi')
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[0-9]+$/, 'Nomor telepon hanya boleh berisi angka (0–9), tanpa spasi atau simbol')
    .refine(
      (val) => val.startsWith('0') || val.startsWith('62'),
      { message: 'Gunakan nomor Indonesia yang dimulai dengan 0 atau 62' }
    ),

  // Legacy single address field for backward compatibility (now optional)
  address: z.string().optional(),
  
  // New structured address fields (optional since address search is used)
  provinsi: z.string().optional(),
  kota: z.string().optional(),
  kecamatan: z.string().optional(),
  kelurahan: z.string().optional(),
  detailedAddress: z.string().min(5, 'Detail alamat (jalan, nomor rumah) minimal 5 karakter'),

  deliveryMethod: z.enum(['gosend', 'grab', 'paxel', 'pickup', 'gosendsameday', 'grabsameday'], {
    required_error: 'Pilih metode pengiriman',
  }),

  paymentMethod: z.enum(['transfer'], {
    required_error: 'Pilih metode pembayaran',
  }),

  notes: z.string().optional(),
});