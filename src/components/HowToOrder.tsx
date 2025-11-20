import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, FileText, Truck, Phone } from 'lucide-react';

export default function HowToOrder() {
    const steps = [
        {
            id: 1,
            icon: ShoppingCart,
            title: "Pilih Menu",
            desc: "Tambahkan cookies, juice, atau pasta favoritmu ke keranjang.",
        },
        {
            id: 2,
            icon: FileText,
            title: "Isi Data",
            desc: "Lengkapi nama, nomor WhatsApp, dan alamat pengiriman.",
        },
        {
            id: 3,
            icon: Truck,
            title: "Cek Ongkir",
            desc: "Pilih kurir dan lihat estimasi ongkir otomatis.",
        },
        {
            id: 4,
            icon: Phone,
            title: "Order via WhatsApp",
            desc: "Kami akan hubungi kamu untuk konfirmasi & pembayaran.",
        },
    ];

    return (
        <section
            id="how-to-order"
            className="mt-12 md:mt-16 mb-12 md:mb-16 py-16 bg-gradient-to-br from-[#FFF0E6] to-[#FFF8F0] how-to-order-texture rounded-3xl"
        >
            <div className="container mx-auto px-4 max-w-4xl">
                <Card className="border-2 border-[#F5D5C5]/40 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#FFF0E6] to-[#FFF8F0] border-b border-[#F5D5C5]/40">
                        <CardTitle className="text-2xl font-bold text-[#8B5A3C] flex items-center justify-center gap-2">
                            How to Order
                        </CardTitle>
                        <CardDescription className="text-[#A0685A] text-center">
                            Empat langkah mudah buat menikmati menu Tiny Bitty di rumah. ✨
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className="group relative flex flex-col items-center rounded-2xl bg-white/80 border border-[#F5D5C5]/30 px-4 py-5 md:px-5 md:py-6 shadow-sm hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(139,90,60,0.18)] transition-all duration-200 backdrop-blur-sm"
                                >
                                    {/* Number pill */}
                                    <div className="absolute text-center top-1">
                                        <div className="inline-flex items-center gap-1 rounded-full bg-[#F5B395] px-3 py-1 text-[11px] font-semibold text-white">
                                            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white text-[#F5B395] text-[10px] font-bold">
                                                {step.id}
                                            </span>
                                            <span>Langkah {step.id}</span>
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className="mt-6 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5B395] shadow-lg shadow-[#8B5A3C40]">
                                        <step.icon className="h-8 w-8 text-white" />
                                    </div>

                                    {/* Text */}
                                    <h3 className="mb-2 text-sm md:text-base font-semibold text-[#8B5A3C] text-center">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-[#A0685A] text-center leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Tip / helper */}
                        <div className="mt-8 rounded-2xl border border-[#F5D5C5]/40 bg-white/60 backdrop-blur-sm px-4 py-4 md:px-5 md:py-4">
                            <div className="flex flex-col items-center gap-2 text-center text-[#8B5A3C] md:flex-row md:justify-center">
                                <span className="text-lg">💡</span>
                                <p className="text-xs md:text-sm font-medium">
                                    Isi data selengkap & sejelas mungkin ya — supaya konfirmasi & pengiriman bisa diproses lebih cepat. ✨
                                </p>
                            </div>
                        </div>
                        {/* CTA */}
                        <div className="mt-10 flex justify-center">
                            <a
                                href="#products"
                                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm md:text-base font-semibold bg-[#F5B395] hover:bg-[#E89A7A] text-white shadow-[0_10px_30px_rgba(245,179,149,0.3)] transition-all duration-200"
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
