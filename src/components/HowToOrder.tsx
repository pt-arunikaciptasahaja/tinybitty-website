import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBasket, FileText, Motorbike, Smartphone, Lightbulb, CircleQuestionMark, UserRoundPen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowToOrder() {
    const steps = [
        {
            id: 1,
            icon: ShoppingBasket,
            title: "Pilih Menu",
            desc: "Tambahkan cookies, juice, atau pasta favoritmu ke keranjang.",
        },
        {
            id: 2,
            icon: UserRoundPen,
            title: "Isi Data",
            desc: "Lengkapi nama, nomor WhatsApp, dan alamat pengiriman.",
        },
        {
            id: 3,
            icon: Motorbike,
            title: "Cek Ongkir",
            desc: "Pilih kurir dan lihat estimasi ongkir otomatis.",
        },
        {
            id: 4,
            icon: Smartphone,
            title: "Order via WhatsApp",
            desc: "Kami akan hubungi kamu untuk konfirmasi & pembayaran.",
        },
    ];

    return (
        <section
            id="how-to-order"
            className="mt-8 lg:-mt-22 md:mt-16 mb-12 md:mb-16 py-16 rounded-3xl bg-secondary/5 border border-secondary/10"
        >
            <div className="container mx-auto px-2 sm:px-4 md:px-7 max-w-none">
                <Card className="rounded-3xl overflow-hidden border-none shadow-xl bg-white">
                    <CardHeader className="bg-white pb-2">
                        <CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center justify-center gap-2 font-montserrat-heading">
                            <CircleQuestionMark className="w-6 h-6 text-primary" />
                            How to Order
                        </CardTitle>
                        <CardDescription className="text-secondary/70 text-center text-sm md:text-base">
                            Empat langkah mudah buat menikmati menu Tiny Bitty di rumah. ✨
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="w-full max-w-none p-3 md:p-4 lg:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className="group relative flex flex-col items-center rounded-2xl bg-white/80 border border-secondary/10 px-4 py-5 md:px-5 md:py-6 shadow-sm hover:-translate-y-1 hover:shadow-primary/20 transition-all duration-200 backdrop-blur-sm"
                                >
                                    {/* Number pill */}
                                    <div className="absolute text-center top-1">
                                        <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-white">
                                            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white text-secondary text-[10px] font-bold">
                                                {step.id}
                                            </span>
                                            <span>Langkah {step.id}</span>
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className="mt-6 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                                        <step.icon className="h-8 w-8 text-white" />
                                    </div>

                                    {/* Text */}
                                    <h3 className="mb-2 text-sm md:text-base font-semibold text-secondary text-center">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-secondary/70 text-center leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Tip / helper */}
                        <div className="mt-8 rounded-2xl border border-secondary/10 bg-white/60 backdrop-blur-sm px-4 py-4 md:px-5 md:py-4">
                            <div className="flex flex-col items-center gap-2 text-center text-secondary/70 md:flex-row md:justify-center">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                <p className="text-xs md:text-sm font-medium">
                                    Isi data selengkap & sejelas mungkin ya — supaya konfirmasi & pengiriman bisa diproses lebih cepat.
                                    ✨
                                </p>
                            </div>
                        </div>
                        {/* CTA */}
                        <motion.div
                            className="mt-10 flex justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            <a
                                href="#products"
                                className="relative rounded-full px-10 py-4 text-sm md:text-base font-bold tracking-wide uppercase transition-all duration-300 overflow-hidden group bg-foreground text-white shadow-lg hover:shadow-primary/20 flex items-center justify-center"
                            >
                                <span className="relative z-10 block pointer-events-none">
                                    Mulai Order
                                </span>
                                <span className="absolute inset-0 z-0 bg-primary scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 origin-center" />
                            </a>
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
