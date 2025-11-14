import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Truck, CreditCard, Package, ChefHat, Phone } from 'lucide-react';

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
      title: "🍪 About Our Products",
      icon: <ChefHat className="w-5 h-5" />,
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
      title: "🚚 Delivery & Pickup",
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
      title: "💳 Ordering & Payment",
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
      title: "🧊 Storage & Handling",
      icon: <Package className="w-5 h-5" />,
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
      title: "📞 Contact & Support",
      icon: <Phone className="w-5 h-5" />,
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

  return (
    <section className="py-16 bg-gradient-to-br from-[#faf7f0] via-[#fefcf8] to-[#f7f3e8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="inline-block px-6 py-3 bg-[#f9c2cd]/20 rounded-full text-sm font-medium text-[#553d8f] border border-[#f9c2cd]/30">
              ❓ Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl bebas-neue-regular text-[#553d8f] mb-4">
            Got Questions?
          </h2>
          <p className="text-lg text-[#11110a]/70 max-w-2xl mx-auto">
            Find answers to the most common questions about our products, ordering, delivery, and more.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-3xl shadow-lg border border-[#f9c2cd]/20 overflow-hidden">
              <div className="bg-gradient-to-r from-[#f9c2cd]/10 to-[#edadc3]/10 px-6 py-4 border-b border-[#f9c2cd]/20">
                <h3 className="text-xl font-bold text-[#553d8f] flex items-center gap-3">
                  {category.icon}
                  {category.title}
                </h3>
              </div>
              
              <div className="divide-y divide-[#f9c2cd]/10">
                {category.questions.map((item, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full text-left px-6 py-4 hover:bg-[#f9c2cd]/5 transition-colors duration-200 flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#11110a] pr-4">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#553d8f] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#553d8f] flex-shrink-0" />
                        )}
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="px-6 pb-4">
                          <p className="text-[#11110a]/80 leading-relaxed">{item.answer}</p>
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
        <div className="text-center mt-12">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#a3e2f5]/30 max-w-2xl mx-auto">
            <div className="mb-4">
              <Phone className="w-12 h-12 text-[#553d8f] mx-auto mb-4" />
            </div>
            <h3 className="text-2xl font-bold text-[#553d8f] mb-4">Still Have Questions?</h3>
            <p className="text-[#11110a]/70 mb-6">
              Can't find the answer you're looking for? We're here to help!
            </p>
            <a
              href="https://wa.me/6281112010160"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#f9c2cd] hover:bg-[#f9c2cd]/90 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-200"
            >
              <Phone className="w-5 h-5" />
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
