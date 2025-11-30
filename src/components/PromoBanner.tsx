import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Banner {
  id: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  link?: string;
}

const banners: Banner[] = [
  {
    id: 'promo-1',
    desktopImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764293161/desktop_plkknz.png',
    mobileImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764293160/mobile_isfqyp.png',
    alt: 'Promo Banner'
  },
  {
    id: 'promo-2',
    desktopImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764499893/Freshly_poured._Freshly_baked._Freshly_made._1_khmp3h.png',
    mobileImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764499893/Freshly_poured._Freshly_baked._Freshly_made._1_khmp3h.png',
    alt: 'Special Offer Banner'
  },
  {
    id: 'promo-3',
    desktopImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764346942/yupp-generated-image-657758_1_g8qooi.png',
    mobileImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764346942/yupp-generated-image-657758_1_g8qooi.png',
    alt: 'New Collection Banner'
  },
  {
    id: 'promo-4',
    desktopImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764489656/yupp-generated-image-510684_1_w9xhx1.jpg',
    mobileImage: 'https://res.cloudinary.com/dodmwwp1w/image/upload/v1764489656/yupp-generated-image-510684_1_w9xhx1.jpg',
    alt: 'New Collaboration Banner'
  }
  // Future banners will be added here
];

export default function PromoBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [api, setApi] = useState<any>(null);

  // Auto-play functionality with infinite loop
  useEffect(() => {
    if (!api || banners.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentBanner + 1) % banners.length;
      setCurrentBanner(nextIndex);
      api.scrollTo(nextIndex);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api, currentBanner, banners.length]);

  // Update current banner when carousel changes
  const onSelect = React.useCallback((api: any) => {
    if (!api) return;
    const selected = api.selectedScrollSnap();
    setCurrentBanner(selected);
  }, []);

  // Set up carousel API
  useEffect(() => {
    if (!api) return;

    onSelect(api);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 md:mt-30 mb-2 md:mb-4 pt-16 md:pt-32 pb-0">
      <div className="container mx-auto px-1 md:px-4">
        <div className="relative">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
                    {/* Desktop Image */}
                    <img
                      src={banner.desktopImage}
                      alt={banner.alt}
                      className="hidden md:block w-full h-128 object-cover"
                      loading="lazy"
                      onClick={() => {
                        if (banner.id === 'promo-4') {
                          document.getElementById('tokyo-crumb')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    />
                    
                    {/* Mobile Image */}
                    <img
                      src={banner.mobileImage}
                      alt={banner.alt}
                      className="block md:hidden w-full h-32 object-contain"
                      loading="lazy"
                      onClick={() => {
                        if (banner.id === 'promo-4') {
                          document.getElementById('tokyo-crumb')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    />
                    
                    {/* Optional overlay for clickable banners */}
                    {banner.link && (
                      <a
                        href={banner.link}
                        className="absolute inset-0 z-10"
                        aria-label={`Visit ${banner.alt}`}
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Show navigation buttons only if there are multiple banners */}
            {banners.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-gradient-to-r from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400 border-purple-200 shadow-sm hidden md:flex" />
                <CarouselNext className="right-2 bg-gradient-to-r from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400 border-purple-200 shadow-sm hidden md:flex" />
              </>
            )}
          </Carousel>
          
          {/* Dots indicator for multiple banners */}
          {banners.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentBanner(index);
                    api?.scrollTo(index);
                  }}
                  className={`rounded-full transition-all duration-500 ${
                    index === currentBanner 
                      ? 'bg-gradient-to-r from-purple-200 to-purple-300 w-8 h-2 shadow-sm' 
                      : 'bg-purple-100 hover:bg-purple-200 w-2 h-2 hover:w-6'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}