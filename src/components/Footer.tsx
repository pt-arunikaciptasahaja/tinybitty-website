import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <section className="mt-12 md:mt-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <footer
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
              'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23edadc3\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex items-center gap-3">
              <img
                src="/logotiny.png"
                alt="Tiny Bitty - Freshly Baked Happiness"
                className="h-14 w-auto object-contain"
                style={{
                  filter:
                    'invert(20%) sepia(100%) saturate(3000%) hue-rotate(255deg) brightness(0.6) contrast(1.8)'
                }}
              />
              <p className="text-lg text-[#11110a]/80 patrick-hand-sc-regular">
                Homemade treats with love 💕
              </p>
            </div>

            <div className="flex items-center gap-6">
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
                className="flex items-center gap-2 text-[#a3e2f5] hover:text-[#a3e2f5]/80 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#a3e2f5]/20 text-center">
            <p className="text-xs text-[#11110a]/60">
              All rights reserved 2025 • Made with ❤️ in Indonesia
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}