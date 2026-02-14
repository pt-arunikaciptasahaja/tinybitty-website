import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface InstagramEmbedProps {
  url: string;
  caption?: string;
  className?: string;
}

interface CustomTestimonial {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  text: string;
  rating: number;
  product: string;
  image?: string;
  isVideo?: boolean;
}

interface InstagramTestimonial {
  id: string;
  accountHandle: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  instagramUrl?: string;
}

interface TestimonialsProps {
  className?: string;
}

// Sample data - replace with your actual Instagram posts and testimonials
const customTestimonials: CustomTestimonial[] = [
  {
    id: '1',
    name: 'Danielle Mottoh',
    handle: '@dani_elle',
    text: "Cookiesnya enak banget… rasanya comforting gitu loh 😭✨ Abis lari pagi cici bawa ke kantor, buka laptop bentar doang, eh udah abis aja. Cici manja approved! 🤌💼💖",
    rating: 5,
    product: 'Heavenly Bites',
    avatar: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764689287/WhatsApp_Image_2025-12-02_at_22.26.08_ftryfk.jpg'
  },
  {
    id: '2',
    name: 'Fajar Tri S',
    handle: '@kapten_kawan',
    text: "Cookiesnya enak parah sih… crunchy di luar, lembut di dalem. Dimakan sambil nyetem gitar langsung auto-ludes 😭🔥 Rasanya tuh kayak chord yang pas—nggak perlu mikir, tinggal nikmatin.",
    rating: 5,
    product: 'Golden Crunch',
    avatar: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764687494/1688027213818_r7plzv.jpg'
  },
  {
    id: '3',
    name: 'Al Saputra',
    handle: '@al_saputra',
    text: 'Juice-nya seger banget, mau dijadiin pre-run boost atau recovery abis lari juga masuk banget. Bikin badan auto-ready buat ngegas pace 5 🤙',
    rating: 5,
    product: 'Strawberry Juice',
    avatar: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764687574/1718872032695_aea6ym.jpg'
  }
];

const instagramTestimonials: InstagramTestimonial[] = [
  {
    id: 'ig1',
    accountHandle: '@tiny.bitty',
    imageUrl: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764574412/Screenshot_2025-12-01_at_14.29.42_dqukxx.png',
    caption: 'A little sneak peek of today’s bake 🍪✨',
    likes: 234,
    comments: 18,
    instagramUrl: 'https://www.instagram.com/reel/DUQLi1kEQ3g/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
  },
  {
    id: 'ig2',
    accountHandle: '@tiny.bitty',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
    caption: 'Fresh Tokyo Crumb bread perfect for breakfast! 🥖☀️',
    likes: 189,
    comments: 12,
    instagramUrl: 'https://www.instagram.com/reel/Cn02mEpMqMW/?utm_source=ig_embed&utm_campaign=loading'
  },
  {
    id: 'ig3',
    accountHandle: '@tiny.bitty',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop',
    caption: 'Healthy juice options for your daily nutrition! 🥤💚',
    likes: 156,
    comments: 8,
    instagramUrl: 'https://www.instagram.com/reel/DNcYvVgz6vq/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
  }
];

const InstagramEmbed = ({ url, caption, className = '' }: InstagramEmbedProps) => {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Instagram embed script if not already loaded
    if (typeof window !== 'undefined' && !window.instgrm) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (window.instgrm && embedRef.current) {
          window.instgrm.Embeds.process();
          // Force resize after embed loads
          setTimeout(() => {
            if (embedRef.current) {
              const iframes = embedRef.current.querySelectorAll('iframe');
              iframes.forEach((iframe: any) => {
                // Set responsive height based on screen size
                const screenWidth = window.innerWidth;
                let height = '794px';
                if (screenWidth >= 1024) {
                  height = '680px';
                } else if (screenWidth >= 768) {
                  height = '950px';
                }
                iframe.style.height = height;
                iframe.style.width = '100%';
              });
            }
          }, 1000);
        }
      };
      document.head.appendChild(script);
    } else if (window.instgrm && embedRef.current) {
      window.instgrm.Embeds.process();
      // Force resize after embed loads
      setTimeout(() => {
        if (embedRef.current) {
          const iframes = embedRef.current.querySelectorAll('iframe');
          iframes.forEach((iframe: any) => {
            // Set responsive height based on screen size
            const screenWidth = window.innerWidth;
            let height = '794px';
            if (screenWidth >= 1024) {
              height = '680px';
            } else if (screenWidth >= 768) {
              height = '950px';
            }
            iframe.style.height = height;
            iframe.style.width = '100%';
          });
        }
      }, 1000);
    }
  }, [url]);

  return (
    <div className={`instagram-embed-container w-full max-w-full h-full ${className}`} ref={embedRef} style={{
      maxWidth: 'calc(100vw - 32px)',
      height: '794px'
    }}>
      <style>
        {`
          .instagram-embed-container {
            height: 794px !important;
            overflow: visible !important;
          }
          .instagram-media {
            width: 100% !important;
            height: 794px !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          .instagram-media > div {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
          .instagram-media iframe {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            min-height: 794px !important;
          }
          /* Desktop view - increase height */
          @media (min-width: 768px) {
            .instagram-embed-container {
              height: 950px !important;
            }
            .instagram-media {
              height: 950px !important;
            }
            .instagram-media iframe {
              min-height: 950px !important;
            }
          }
          @media (min-width: 1024px) {
            .instagram-embed-container {
              height: 680px !important;
            }
            .instagram-media {
              height: 680px !important;
            }
            .instagram-media iframe {
              min-height: 680px !important;
            }
          }
          @media (max-width: 640px) {
            .instagram-media {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .instagram-media > div {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        `}
      </style>
      <blockquote
        className="instagram-media bg-white border-0 rounded-lg shadow-lg w-full max-w-full mx-auto"
        data-instgrm-captioned
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          margin: '0.25rem',
          padding: '0',
          width: '100%',
          maxWidth: '100%',
          minWidth: '0',
          height: 'auto',
          overflow: 'visible',
        }}
      >
        <div className="p-2 sm:p-4">
          <a
            href={url}
            className="block bg-white text-center no-underline w-full"
            style={{
              lineHeight: '0',
              padding: '0',
              textDecoration: 'none',
              fontSize: '10px',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="text-blue-500 text-xs font-medium">
              See this post on Instagram
            </div>
          </a>
        </div>
      </blockquote>
    </div>
  );
};

const CustomTestimonialCard = ({ testimonial }: { testimonial: CustomTestimonial }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start space-x-4 mb-4 md:mb-6">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-primary text-lg md:text-xl">{testimonial.name}</h4>
            <p className="text-sm text-secondary/70">{testimonial.handle}</p>
          </div>
          {/* Rating stars - hidden on mobile, visible on desktop */}
          <div className="hidden md:flex space-x-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <span key={i} className="text-yellow-400">⭐</span>
            ))}
          </div>
        </div>

        <blockquote className="text-secondary/90 mb-4 italic">
          "{testimonial.text}"
        </blockquote>

        <div className="flex items-center justify-center mb-3">
          <Badge className="text-xs bg-secondary text-white hover:bg-secondary/90">
            {testimonial.product}
          </Badge>
          {testimonial.isVideo && (
            <Badge variant="outline" className="text-xs">
              Video Review
            </Badge>
          )}
        </div>
        {/* Rating stars - visible on mobile, hidden on desktop */}
        <div className="flex md:hidden justify-center space-x-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <span key={i} className="text-yellow-400">⭐</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const InstagramPostCard = ({ instagram }: { instagram: InstagramTestimonial }) => {
  // If there's an Instagram URL, use the actual Instagram embed
  if (instagram.instagramUrl && instagram.instagramUrl.includes('instagram.com')) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 rounded-lg bg-white">
        <div className="flex-1 w-full p-1 sm:p-2 md:p-4">
          <InstagramEmbed
            url={instagram.instagramUrl}
            caption={instagram.caption}
            className="w-full h-full max-w-full"
          />
        </div>
      </div>
    );
  }

  // Fallback to the custom card design for placeholder data
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 rounded-lg border-secondary/10">
      {/* Header with account handle and Instagram icon */}
      <div className="relative bg-white p-2 sm:p-3 md:p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary text-xs sm:text-sm md:text-base">{instagram.accountHandle}</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      </div>

      {/* Post Image */}
      <div className="aspect-square overflow-hidden flex-shrink-0">
        <img
          src={instagram.imageUrl}
          alt="Instagram post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions and Caption */}
      <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
            <button className="flex items-center space-x-1 text-gray-700 hover:text-pink-500 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-medium">{instagram.likes}</span>
            </button>

            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-medium">{instagram.comments}</span>
            </button>

            <button className="ml-auto text-gray-700 hover:text-green-500 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-end">
          <p className="text-xs text-secondary/90 leading-relaxed">
            <span className="font-semibold text-primary">{instagram.accountHandle}</span> {instagram.caption}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default function Testimonials({ className = '' }: TestimonialsProps) {
  return (
    <section id="testimonials"
      className="mt-8 lg:-mt-22 md:mt-16 mb-12 md:mb-16 py-16 rounded-3xl bg-secondary/5 border border-secondary/10">
      <div className="container mx-auto px-2 sm:px-4 md:px-7 max-w-none">
        <Card className="rounded-3xl overflow-hidden border-none shadow-xl">
          <CardContent className="w-full max-w-none p-3 md:p-4 lg:p-6">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Be Part of the Cookie Crush.
              </h2>
              <p className="text-lg text-secondary/70 max-w-4xl mx-auto">
                Thousands of fans, millions of bites—see how Tiny Bitty lovers celebrate the flavor.
              </p>
            </div>

            {/* Custom Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {customTestimonials.map((testimonial) => (
                <CustomTestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>

            {/* Instagram Style Posts */}
            <div>
              {/* <h3 className="text-2xl font-semibold text-[#553d8f] mb-8 text-center" style={{ fontFamily: "'Josefin Slab', serif" }}>
                From Our Instagram
              </h3> */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-6 px-1 md:px-0 max-w-full overflow-hidden">
                {instagramTestimonials.map((instagram) => (
                  <div key={instagram.id} className="flex h-full min-h-[680px] md:min-h-[950px] lg:min-h-[680px] w-full">
                    <InstagramPostCard instagram={instagram} />
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              {/* <p className="text-[#553d8f]/80 mb-4">
                Follow us on Instagram for more delicious updates!
              </p> */}
              <a
                href="https://www.instagram.com/tiny.bitty"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center px-8 py-3 bg-foreground text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-primary/20 overflow-hidden group"
              >
                <div className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Follow @tiny.bitty
                </div>
                <span className="absolute inset-0 z-0 bg-primary scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 origin-center" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Type declaration for Instagram global object
declare global {
  interface Window {
    instgrm: any;
  }
}