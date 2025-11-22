import { useState } from 'react';
import { ChevronDown, ChevronUp, Truck, CreditCard, Phone, HelpCircle, Cookie, Snowflake, MessageCircle, MessageCircleQuestionMark, Smartphone } from 'lucide-react';

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "About Our Products",
      icon: <Cookie className="w-5 h-5" />,
      questions: [
        {
          question: "How fresh are your cookies and how long do they last?",
          answer: "Our cookies are baked fresh daily! They can last 3-5 days at room temperature, 2-3 weeks in the refrigerator, and up to 2 months in the freezer. For the best taste and texture, we recommend consuming them within the first few days."
        },
        {
          question: "Do your products contain preservatives?",
          answer: "No! All our products are 100% natural. Our cookies are baked with Australian butter, brown sugar, and premium ingredients. Our juices are made from fresh fruits without any preservatives, and our macaroni schotel contains only fresh cheese and quality ingredients."
        },
        {
          question: "What ingredients do you use in your cookies?",
          answer: "We use premium ingredients including Australian butter, brown sugar, flour, chocolate chips, almonds, oats, raisins, and fresh cheese. All ingredients are carefully selected for quality and taste."
        },
        {
          question: "Are your products suitable for people with allergies?",
          answer: "Our cookies contain wheat flour, dairy (butter), and nuts (almonds). Our juices are generally dairy-free. If you have specific allergies, please contact us before ordering and we'll advise on the best options for you."
        }
      ]
    },
    {
      title: "Delivery & Pickup",
      icon: <Truck className="w-5 h-5" />,
      questions: [
        {
          question: "What areas do you deliver to?",
          answer: "We currently deliver within Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi) and Bandung area. This ensures our products arrive fresh and in perfect condition."
        },
        {
          question: "How much does delivery cost?",
          answer: "Delivery costs vary by distance and delivery method (GoSend, Grab Express, or Paxel). The cost will be calculated during checkout and shown before you confirm your order. Most deliveries range from IDR 15,000 - 35,000."
        },
        {
          question: "How long does delivery take?",
          answer: "Delivery time depends on your location and delivery method: GoSend Instant (1-3 hours), Grab Express (2-4 hours), or Paxel (same day to next day). We'll provide estimated delivery time during order confirmation."
        },
        {
          question: "Do you offer pickup?",
          answer: "Yes! You can pick up your orders from our kitchen. We'll provide the pickup address and available time slots when you place your order."
        },
        {
          question: "What if I'm not home during delivery?",
          answer: "Please ensure someone is available to receive your order. For heat-sensitive items like our cookies and juices, we recommend being present for delivery. You can also choose pickup if you're unsure about timing."
        }
      ]
    },
    {
      title: "Ordering & Payment",
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          question: "How do I place an order?",
          answer: "Simply browse our menu, add items to your cart, fill out the order form with your details and address, and click 'Order via WhatsApp'. We'll contact you via WhatsApp to confirm your order and arrange payment."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We currently accept bank transfers. Once you place an order via WhatsApp, we'll send you our bank account details for payment confirmation."
        },
        {
          question: "Is there a minimum order amount?",
          answer: "Yes, the minimum order is IDR 50,000 (excluding delivery cost). This helps us maintain efficient operations and ensure quality service."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order before we start preparing it (usually within 2 hours of ordering). Please contact us via WhatsApp as soon as possible to make changes."
        },
        {
          question: "Do you take custom orders?",
          answer: "Yes! We love creating custom cookies for special occasions. Please contact us via WhatsApp at least 2-3 days in advance to discuss your custom requirements."
        }
      ]
    },
    {
      title: "Storage & Handling",
      icon: <Snowflake className="w-5 h-5" />,
      questions: [
        {
          question: "How should I store my cookies?",
          answer: "Store cookies in an airtight container at room temperature. For longer storage, refrigerate in a sealed container. For maximum freshness, freeze in a freezer bag for up to 2 months."
        },
        {
          question: "How should I store the juice drinks?",
          answer: "Keep refrigerated at all times (2-4°C). Consume within 24 hours of opening. The juices are best enjoyed cold for optimal taste and texture."
        },
        {
          question: "How should I store macaroni schotel?",
          answer: "Macaroni schotel should be refrigerated immediately upon delivery. Consume within 2-3 days, or freeze for up to 1 month. Reheat in oven or microwave before serving."
        },
        {
          question: "Are your products sensitive to heat?",
          answer: "Yes, our cookies and macaroni schotel can be affected by extreme heat. We recommend not leaving them in hot cars or direct sunlight for extended periods."
        }
      ]
    },
    {
      title: "Contact & Support",
      icon: <MessageCircle className="w-5 h-5" />,
      questions: [
        {
          question: "How can I contact customer service?",
          answer: "You can reach us via WhatsApp at +62 811-1201-0160 for any questions, orders, or support. We're usually available 9 AM - 9 PM, 7 days a week."
        },
        {
          question: "What if I have a problem with my order?",
          answer: "Please contact us immediately via WhatsApp if you have any issues with your order. We take customer satisfaction seriously and will work to resolve any problems quickly."
        },
        {
          question: "Do you cater for events or bulk orders?",
          answer: "Yes! We provide catering services for events, parties, and corporate orders. Please contact us 1 week in advance for large orders. Discounts may apply for bulk purchases."
        },
        {
          question: "Can I visit your kitchen?",
          answer: "We offer limited kitchen visits for pickup and custom order consultations. Please contact us to arrange a visit time."
        }
      ]
    }
  ];

  const faqCategoriesID = [
    {
      title: "Tentang Produk Kami",
      icon: <Cookie className="w-5 h-5" />,
      questions: [
        {
          question: "Seberapa fresh cookies kalian? Tahan berapa lama?",
          answer: "Cookies kita dibuat fresh setiap hari! Tahan 3–5 hari di suhu ruangan, 2–3 minggu di kulkas, dan sampai 2 bulan kalau disimpan di freezer. Tapi paling enak dimakan di hari-hari awal ya!"
        },
        {
          question: "Produk kalian pakai pengawet nggak?",
          answer: "Nggak sama sekali! Semua produk 100% tanpa bahan pengawet. Cookies dibuat pakai Australian butter, brown sugar, dan bahan premium. Juice dibuat dari buah segar tanpa tambahan kimia. Macaroni schotel juga pakai keju dan bahan segar berkualitas."
        },
        {
          question: "Bahan apa aja sih yang dipakai untuk cookies?",
          answer: "Kita pakai bahan premium seperti Australian butter, brown sugar, tepung, chocolate chips, almond, oats, raisin, dan fresh cheese. Semua dipilih biar rasanya maksimal."
        },
        {
          question: "Aman nggak buat yang punya alergi?",
          answer: "Cookies kita mengandung tepung terigu, dairy (butter), dan kacang (almond). Juice umumnya dairy-free. Kalau punya alergi tertentu, chat kita dulu ya biar kita bantu rekomendasi pilihan aman."
        }
      ]
    },
    {
      title: "Pengiriman & Pickup",
      icon: <Truck className="w-5 h-5" />,
      questions: [
        {
          question: "Kirimnya ke mana aja?",
          answer: "Saat ini pengiriman tersedia untuk area Jabodetabek dan Bandung. Ini biar produk sampai dalam kondisi fresh & aman."
        },
        {
          question: "Ongkirnya berapa?",
          answer: "Tergantung jarak & metode kirim (GoSend, GrabExpress, Paxel). Ongkir akan muncul saat checkout sebelum kamu konfirmasi. Biasanya di kisaran 15–35 ribu."
        },
        {
          question: "Estimasi waktu pengiriman berapa lama?",
          answer: "Tergantung lokasi & metode: GoSend Instant (1–3 jam), GrabExpress (2–4 jam), Paxel (same day / next day). Estimasi detail akan kita info saat konfirmasi."
        },
        {
          question: "Bisa ambil sendiri?",
          answer: "Bisa! Kamu bisa pickup di dapur kami. Detail alamat & jam pickup akan dikirim saat order."
        },
        {
          question: "Gimana kalau aku nggak di rumah waktu pesanan datang?",
          answer: "Pastikan ada yang bisa terima pesanan ya. Cookies & juice sensitif panas, jadi lebih aman kalau kamu standby atau pilih pickup kalau waktunya fleksibel."
        }
      ]
    },
    {
      title: "Pemesan & Pembayaran",
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          question: "Cara ordernya gimana?",
          answer: "Tinggal pilih menu, masukin keranjang, isi data pengiriman, dan klik 'Order via WhatsApp'. Nanti kita follow up lewat WA untuk konfirmasi & pembayaran."
        },
        {
          question: "Metode pembayaran apa yang tersedia?",
          answer: "Saat ini pembayaran via transfer bank. Setelah order lewat WA, kita kirim nomor rekening untuk proses pembayaran."
        },
        {
          question: "Minimal order berapa?",
          answer: "Minimal order Rp50.000 (di luar ongkir). Biar proses produksi & pengiriman tetap efisien."
        },
        {
          question: "Bisa ubah atau cancel order?",
          answer: "Bisa sebelum pesanan mulai dibuat (biasanya dalam 2 jam setelah order). Chat kita secepatnya ya kalau ada perubahan."
        },
        {
          question: "Bisa request custom order?",
          answer: "Bisa banget! Untuk acara atau bentuk custom, chat dulu minimal 2–3 hari sebelumnya ya."
        }
      ]
    },
    {
      title: "Penyimpanan & Cara Penyajian",
      icon: <Snowflake className="w-5 h-5" />,
      questions: [
        {
          question: "Gimana cara simpan cookies?",
          answer: "Simpan di wadah kedap udara. Kalau mau lebih lama, masukin kulkas. Untuk jangka panjang, bisa di-freezer sampai 2 bulan."
        },
        {
          question: "Kalau minuman juice disimpan gimana?",
          answer: "Selalu simpan di kulkas (2–4°C). Habis dibuka, habiskan dalam 24 jam. Paling nikmat diminum dingin!"
        },
        {
          question: "Cara simpan macaroni schotel?",
          answer: "Langsung masuk kulkas setelah diterima. Habis dalam 2–3 hari, atau bisa di-freeze sampai 1 bulan. Panaskan sebelum makan."
        },
        {
          question: "Produknya sensitif panas nggak?",
          answer: "Iya, terutama cookies dan schotel. Hindari taruh di mobil panas atau kena matahari lama-lama ya."
        }
      ]
    },
    {
      title: "Kontak & Bantuan",
      icon: <MessageCircle className="w-5 h-5" />,
      questions: [
        {
          question: "Hubungi customer service ke mana?",
          answer: "Bisa lewat WhatsApp ke +62 811-1201-0160. Kami online jam 09.00–21.00 setiap hari."
        },
        {
          question: "Kalau ada masalah dengan pesanan?",
          answer: "Langsung chat kita di WhatsApp ya. Kita bakal bantu sampai beres!"
        },
        {
          question: "Bisa untuk event atau order banyak?",
          answer: "Bisa banget, kita terima pesanan untuk event & corporate. Minimal chat H-7 ya. Ada harga khusus untuk jumlah besar."
        },
        {
          question: "Bisa datang ke dapur?",
          answer: "Bisa untuk pickup atau konsultasi custom order, tapi harus janjian dulu ya."
        }
      ]
    }
  ];
  

  return (
    <div className="card-standard">
      {/* FAQ Categories */}
      <div className="space-y-6">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="card-elevated">
            <div className="bg-[#ebeafd] from-secondary/10 to-accent/10 px-6 py-4 border-b border-border rounded-t-lg">
              <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                {category.icon}
                {category.title}
              </h3>
            </div>
            
            <div className="divide-y divide-border">
              {category.questions.map((item, questionIndex) => {
                const globalIndex = categoryIndex * 100 + questionIndex;
                const isOpen = openItems.includes(globalIndex);
                
                return (
                  <div key={questionIndex}>
                    <button
                      onClick={() => toggleItem(globalIndex)}
                      className="w-full text-left px-6 py-4 hover:bg-secondary/5 transition-colors duration-200 flex items-center justify-between"
                    >
                      <span className="font-semibold text-foreground pr-4">{item.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-6 pb-4">
                        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="card-elevated mt-6 md:mt-8 text-center">
        <div className="mb-6">
          <MessageCircleQuestionMark className="w-16 h-16 text-[#553d8f] mx-auto mb-4" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-4">
          Still Have <span className="text-[#553d8f]">Questions?</span>
        </h3>
        <p className="body-base mb-8 mx-auto">
          Can't find the answer you're looking for? We're here to help!
        </p>
        <a
          href="https://wa.me/6281112010160"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#553d8f] hover:bg-[#553d8f]/90 text-primary-foreground px-4 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <Smartphone className="w-4 h-4 md:w-5 md:h-5" />
          Chat with us on WhatsApp
        </a>
      </div>
    </div>
  );
}

{/* <h3 className="text-2xl font-bold text-primary mb-4">
  Masih Bingung <span className="text-[#553d8f]">? 😁</span>
</h3>

<p className="body-base mb-8 mx-auto">
  Belum nemu jawaban yang kamu cari? Santai, tanya aja langsung!
</p>

<a
  href="https://wa.me/6281112010160"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 bg-[#553d8f] hover:bg-[#553d8f]/90 text-primary-foreground px-6 py-3 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
>
  <Phone className="w-5 h-5" />
  Chat via WhatsApp
</a> */}
