import { Instagram, MessageCircle, Heart, Clock, MapPin, Phone, Mail, Star } from 'lucide-react';
import { cldThumb } from '@/lib/cdn';

export default function Footer() {
  return (
    <section className="mb-8 md:mb-10">
      <div
        className="
          rounded-3xl md:rounded-[2rem]
          p-5 md:p-8 lg:p-10
          overflow-hidden
          border
        bg-muted/30"
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 md:mb-8">
          {/* Brand Section */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              <img
                src={cldThumb(
                  "https://res.cloudinary.com/dodmwwp1w/image/upload/v1771073687/ddf_t3dojo.png",
                  { width: 320, quality: "auto:eco" },
                )}
                alt="Tiny Bitty - Freshly Baked Happiness"
                className="h-12 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
              {/* <div className="flex items-center gap-2">
                <span className="text-base text-secondary delius-regular">Tiny Bitty</span>
                <Heart className="w-6 h-6 text-secondary fill-current" />
              </div> */}
            </div>
            <p className="text-secondary/80 mb-3 text-xs md:text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
              Homemade treats with love, baked fresh daily for your special moments.
              Creating sweet memories one cookie at a time.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-secondary fill-current" />
              ))}
              <span className="text-[10px] md:text-xs text-secondary/60 ml-2">4.9/5 from 500+ happy customers</span>
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="text-left sm:text-left">
            <h3 className="font-semibold text-secondary mb-3 text-base md:text-lg">Order & Contact</h3>
            <div className="w-full flex justify-center sm:justify-start">
              <div className="space-y-3 text-left w-[260px] sm:w-auto">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm text-secondary">
                    <p className="font-medium">Business Hours:</p>
                    <p>Mon - Sat: 8:00 AM - 8:00 PM</p>
                    <p>Sunday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm text-secondary">
                    <p className="font-medium">WhatsApp Orders:</p>
                    <a href="https://wa.me/6281112010160" className="hover:text-secondary/80 transition-colors">
                      +62 811-1201-0160
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm text-secondary">
                    <p className="font-medium">Delivery Areas:</p>
                    <p>Jakarta, Bogor, Depok,</p>
                    <p>Tangerang, Bekasi (Jabodetabek)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social & CTA */}
          <div className="text-left sm:text-left">
            <h3 className="font-semibold text-secondary mb-3 text-base md:text-lg">Follow & Order</h3>
            <div className="w-full flex justify-center sm:justify-start">
              <div className="space-y-3 text-left w-[260px] sm:w-auto">
                <a
                  href="https://www.instagram.com/tiny.bitty/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-secondary hover:text-secondary/80 transition-colors group"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs md:text-sm font-medium">@tiny.bitty</p>
                    <p className="text-[10px] opacity-85">See our latest creations</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/6281112010160?text=Hi! I'd like to order some delicious treats from Tiny Bitty. Could you please share your menu?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-secondary hover:text-secondary/80 transition-colors group"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs md:text-sm font-medium">Order via WhatsApp</p>
                    <p className="text-[10px] opacity-85">Freshly baked, ready to deliver</p>
                  </div>
                </a>

                <div className="pt-2 border-t border-secondary/20 w-full">
                  <p className="text-[10px] md:text-xs text-secondary/60 leading-relaxed text-left sm:text-left">
                    • Same-day delivery available <br className="sm:hidden" />
                    • Custom orders welcome <br className="sm:hidden" />
                    • Quality ingredients
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-secondary/20">
          <div className="flex justify-center items-center">
            <div className="text-[10px] md:text-xs text-secondary/60 text-center">
              <p>© {new Date().getFullYear()} Tiny Bitty. All rights reserved. <br />Made with ❤️ for cookie lovers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}