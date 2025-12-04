import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBasket, FileText, Motorbike, Smartphone, Lightbulb, CircleQuestionMark, UserRoundPen } from 'lucide-react';

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
            className="mt-8 lg:-mt-22 md:mt-16 mb-12 md:mb-16 py-16 rounded-3xl bg-[#C5B8FF]/20 border"
        >
            <div className="container mx-auto px-2 sm:px-4 md:px-7 max-w-none">
                <Card className="rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-[#553d8f]/10">
                        <CardTitle className="text-2xl font-bold text-[#553d8f] flex items-center justify-center gap-2">
                        <CircleQuestionMark className="w-5 h-5 text-[#553d8f]" />
                            How to Order
                        </CardTitle>
                        <CardDescription className="text-[#553d8f]/80 text-center">
                            Empat langkah mudah buat menikmati menu Tiny Bitty di rumah. ✨
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="w-full max-w-none p-3 md:p-4 lg:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className="group relative flex flex-col items-center rounded-2xl bg-white/80 border border-purple-200/50 px-4 py-5 md:px-5 md:py-6 shadow-sm hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(147,51,234,0.25)] transition-all duration-200 backdrop-blur-sm"
                                >
                                    {/* Number pill */}
                                    <div className="absolute text-center top-1">
                                        <div className="inline-flex items-center gap-1 rounded-full bg-[#553d8f] px-3 py-1 text-[11px] font-semibold text-white">
                                            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white text-[#553d8f] text-[10px] font-bold">
                                                {step.id}
                                            </span>
                                            <span>Langkah {step.id}</span>
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className="mt-6 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#553d8f] shadow-lg shadow-[#553d8f]/25">
                                        <step.icon className="h-8 w-8 text-white" />
                                    </div>

                                    {/* Text */}
                                    <h3 className="mb-2 text-sm md:text-base font-semibold text-[#553d8f] text-center">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-[#553d8f]/80 text-center leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Tip / helper */}
                        <div className="mt-8 rounded-2xl border border-purple-200/60 bg-white/60 backdrop-blur-sm px-4 py-4 md:px-5 md:py-4">
                            <div className="flex flex-col items-center gap-2 text-center text-[#553d8f]/80 md:flex-row md:justify-center">
                            <Lightbulb className="w-5 h-5 text-[#553d8f]/60" />
                                <p className="text-xs md:text-sm font-medium">
                                    Isi data selengkap & sejelas mungkin ya — supaya konfirmasi & pengiriman bisa diproses lebih cepat. 
                                    ✨
                                </p>
                            </div>
                        </div>
                        {/* CTA */}
                        <div className="mt-10 flex justify-center">
                            <a
                                href="#products"
                                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm md:text-base font-semibold bg-[#553d8f] hover:bg-[#4a337a] text-white shadow-[0_10px_30px_rgba(85,61,143,0.25)] transition-all duration-200"
                            >
                                Mulai Order
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
