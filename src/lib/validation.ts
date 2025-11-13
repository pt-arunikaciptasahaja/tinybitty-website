import { z } from 'zod';

export const orderFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh berisi angka'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  deliveryMethod: z.enum(['gosendInstant', 'grab', 'paxel'], {
    required_error: 'Pilih metode pengiriman',
  }),
  paymentMethod: z.enum(['transfer'], {
    required_error: 'Pilih metode pembayaran',
  }),
  notes: z.string().optional(),
});