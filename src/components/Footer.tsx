import { Instagram, MessageCircle, Heart, Clock, MapPin, Phone, Mail, Star } from 'lucide-react';

export default function Footer() {
  return (
    <section className="mb-12 md:mb-16">
      <div
        className="
          rounded-3xl md:rounded-[2rem]
          p-6 md:p-8 lg:p-10
          overflow-hidden
          border
        bg-[#C5B8FF]/20"
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <img
                src="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574652/logo-purple_dlshle.png"
                alt="Tiny Bitty - Freshly Baked Happiness"
                className="h-14 w-auto object-contain"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg text-[#553d8f] delius-regular">Tiny Bitty</span>
                <Heart className="w-8 h-8 text-[#553d8f] fill-current" />
              </div>
            </div>
            <p className="text-[#553d8f]/80 mb-4 text-sm leading-relaxed">
              Homemade treats with love, baked fresh daily for your special moments. 
              Creating sweet memories one cookie at a time.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#553d8f] fill-current" />
              ))}
              <span className="text-xs text-[#553d8f]/60 ml-2">4.9/5 from 500+ happy customers</span>
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="text-center lg:text-left">
            <h3 className="flex items-start font-semibold text-[#553d8f] mb-4 text-lg">Order & Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#553d8f] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#553d8f] text-left">
                  <p className="font-medium">Business Hours:</p>
                  <p>Mon - Sat: 8:00 AM - 8:00 PM</p>
                  <p>Sunday: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#553d8f] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#553d8f] text-left">
                  <p className="font-medium">WhatsApp Orders:</p>
                  <a href="https://wa.me/6281112010160" className="hover:text-[#553d8f]/80 transition-colors">
                    +62 811-1201-0160
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#553d8f] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#553d8f] text-left">
                  <p className="font-medium">Delivery Areas:</p>
                  <p>Jakarta, Bogor, Depok,</p>
                  <p>Tangerang, Bekasi (Jabodetabek)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social & CTA */}
          <div className="text-center lg:text-left">
            <h3 className="flex items-start font-semibold text-[#553d8f] mb-4 text-lg">Follow & Order</h3>
            <div className="space-y-4">
              <a
                href="https://www.instagram.com/tiny.bitty/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-[#553d8f] hover:text-[#553d8f]/80 transition-colors group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">@tiny.bitty</p>
                  <p className="text-xs opacity-80">See our latest creations</p>
                </div>
              </a>
              
              <a
                href="https://wa.me/6281112010160?text=Hi! I'd like to order some delicious treats from Tiny Bitty. Could you please share your menu?"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-[#553d8f] hover:text-[#553d8f]/80 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Order via WhatsApp</p>
                  <p className="text-xs opacity-80">Freshly baked, ready to deliver</p>
                </div>
              </a>

              <div className="pt-3 border-t border-[#553d8f]/20 text-left">
                <p className="text-xs text-[#553d8f]/60 leading-relaxed">
                  - Same-day delivery available<br/>
                  {/* 🚚 Di luar Jakarta? Chat kami dulu lewat WhatsApp yaa 💜<br/> */}
                  - Custom orders welcome<br/>
                  - Quality ingredients
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-[#553d8f]/20">
          <div className="flex justify-center items-center">
            <div className="text-xs text-[#553d8f]/60 text-center">
              <p>© 2025 Tiny Bitty. All rights reserved. <br/>Made with ❤️ for cookie lovers.</p>
              {/* <p className="mt-1">Freshly baked in Jakarta • Order online for the best experience</p> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}