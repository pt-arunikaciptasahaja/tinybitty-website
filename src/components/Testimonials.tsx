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
    name: 'Sarah Wijaya',
    handle: '@sarah_wijaya',
    text: 'Cookiesnya enak banget, anakku langsung rebutan 😅 Manisnya pas, dan teksturnya tuh bikin nagih. Buat bekal sekolah juga aman.',
    rating: 5,
    product: 'Heavenly Bites',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2', 
    name: 'Budi Santoso',
    handle: '@budi_santoso',
    text: 'Cookiesnya enak parah sih… crunchy tapi dalemnya masih lembut. Dimakan sambil nonton drama langsung habis 😭🔥',
    rating: 5,
    product: 'Choco Almond',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Maya Putri',
    handle: '@maya_putri',
    text: 'Juice-nya seger banget, kerasa buah asli. Aku suka minum pagi-pagi biar melek, dan anakku juga doyan. Win-win banget.',
    rating: 5,
    product: 'Mixed Berry Juice',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
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
    instagramUrl: 'https://www.instagram.com/reel/CrncO0-NH_f/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
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
                iframe.style.height = '794px';
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
            iframe.style.height = '794px';
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
          <Avatar className="h-12 w-12">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-[#553d8f] text-lg md:text-xl">{testimonial.name}</h4>
            <p className="text-sm text-[#553d8f]/80">{testimonial.handle}</p>
          </div>
          {/* Rating stars - hidden on mobile, visible on desktop */}
          <div className="hidden md:flex space-x-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <span key={i} className="text-yellow-400">⭐</span>
            ))}
          </div>
        </div>
        
        <blockquote className="text-[#553d8f]/90 mb-4">
          "{testimonial.text}"
        </blockquote>
        
        <div className="flex items-center justify-center mb-3">
          <Badge className="text-xs bg-[#C5B8FF] text-white">
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
    <Card className="w-full h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 rounded-lg">
      {/* Header with account handle and Instagram icon */}
      <div className="relative bg-white p-2 sm:p-3 md:p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#553d8f] text-xs sm:text-sm md:text-base">{instagram.accountHandle}</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
          <p className="text-xs text-[#553d8f]/90 leading-relaxed">
            <span className="font-semibold text-[#553d8f]">{instagram.accountHandle}</span> {instagram.caption}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default function Testimonials({ className = '' }: TestimonialsProps) {
  return (
    <section id="testimonials"
    className="mt-8 lg:-mt-22 md:mt-16 mb-12 md:mb-16 py-16 bg-gradient-to-br from-purple-50 to-[#553d8f]/10 testimonials-texture rounded-3xl">
      <div className="container mx-auto px-2 sm:px-4 md:px-7 max-w-none">
        <Card className="border-2 border-purple-200/60 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="w-full max-w-none p-3 md:p-4 lg:p-6">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#553d8f] mb-4">
                Be Part of the Cookie Crush.
              </h2>
              <p className="text-lg text-[#553d8f]/80 max-w-4xl mx-auto">
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
              <h3 className="text-2xl font-semibold text-[#553d8f] mb-8 text-center">
                From Our Instagram
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-6 px-1 md:px-0 max-w-full overflow-hidden">
                {instagramTestimonials.map((instagram) => (
                  <div key={instagram.id} className="flex h-full min-h-[800px] w-full">
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
                className="inline-flex items-center px-6 py-3 bg-[#553d8f] hover:bg-[#4a337a] text-white font-semibold rounded-full transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow @tiny.bitty
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