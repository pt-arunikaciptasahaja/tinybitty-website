import { Instagram, MessageCircle, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <section className="mb-12 md:mb-16">
      <div
        className="
          cookie-texture
          rounded-3xl md:rounded-[2rem]
          p-6 md:p-8 lg:p-10
          overflow-hidden
          border border-[#a3e2f5]/20
        "
        style={{
          backgroundColor: '#ebeafd',
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'20\' viewBox=\'0 0 24 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 18c0-1.105.887-2 1.998-2 1.104 0 2-.895 2.002-1.994V14v6h-4v-2zM0 13.998C0 12.895.888 12 2 12c1.105 0 2 .888 2 2 0 1.105.888 2 2 2 1.105 0 2 .888 2 2v2H0v-6.002zm16 4.004A1.994 1.994 0 0 1 14 20c-1.105 0-2-.887-2-1.998v-4.004A1.994 1.994 0 0 0 10 12c-1.105 0-2-.888-2-2 0-1.105-.888-2-2-2-1.105 0-2-.887-2-1.998V1.998A1.994 1.994 0 0 0 2 0a2 2 0 0 0-2 2V0h8v2c0 1.105.888 2 2 2 1.105 0 2 .888 2 2 0 1.105.888 2 2 2 1.105 0 2-.888 2-2 0-1.105.888-2 2-2 1.105 0 2-.888 2-2V0h4v6.002A1.994 1.994 0 0 1 22 8c-1.105 0-2 .888-2 2 0 1.105-.888 2-2 2-1.105 0-2 .887-2 1.998v4.004z\' fill=\'%236b33c3\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dodmwwp1w/image/upload/v1763574652/logo-purple_dlshle.png"
              alt="Tiny Bitty - Freshly Baked Happiness"
              className="h-14 w-auto object-contain"
            />
            <div className="flex items-center gap-3">
              <span className="text-lg text-[#11110a]/80 delius-regular">Homemade treats with love</span>
              <Heart className="w-10 h-10 text-[#553d8f] fill-current" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-1.5 md:mt-0">
            <a
              href="https://www.instagram.com/tiny.bitty/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#553d8f] hover:text-[#553d8f]/80 transition-colors"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm font-medium">@tinybitty</span>
            </a>

            <a
              href="https://wa.me/6281112010160"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#553d8f] hover:text-[#a3e2f5]/80 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#a3e2f5]/20 text-center">
          <p className="text-xs text-[#11110a]/60">
            All rights reserved 2025 • tinybitty
          </p>
        </div>
      </div>
    </section>
  );
}