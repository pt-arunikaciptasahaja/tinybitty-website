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

  address: z.string().min(10, 'Alamat minimal 10 karakter'),

  deliveryMethod: z.enum(['gosend', 'grab', 'paxel', 'pickup'], {
    required_error: 'Pilih metode pengiriman',
  }),

  paymentMethod: z.enum(['transfer'], {
    required_error: 'Pilih metode pembayaran',
  }),

  notes: z.string().optional(),
});