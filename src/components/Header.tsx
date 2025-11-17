import { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import CartSheet from './CartSheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavigation = (hash: string) => {
    // Navigate to homepage
    navigate('/');
    
    // Wait a moment for navigation to complete, then scroll to section
    setTimeout(() => {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <div className="mx-4 md:mx-8 lg:mx-12 xl:mx-16">
        <div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo-purple.png"
                alt="Tiny Bitty - Freshly Baked Happiness"
                className="h-16 md:h-20 w-auto object-contain"
                // style={{
                //   filter: 'invert(20%) sepia(100%) saturate(3000%) hue-rotate(255deg) brightness(0.6) contrast(1.8)'
                // }}
              />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleNavigation('#products')}
                className="text-sm font-medium text-[#11110a] nav-link-hover bg-transparent border-0 cursor-pointer"
              >
                Products
              </button>
              <Link
                to="/faq"
                className="text-sm font-medium text-[#11110a] nav-link-hover"
              >
                FAQ
              </Link>
              <Link
                to="/ingredients"
                className="text-sm font-medium text-[#11110a] nav-link-hover"
              >
                Ingredients
              </Link>
              <Link
                to="/our-story"
                className="text-sm font-medium text-[#11110a] nav-link-hover"
              >
                Our Story
              </Link>
              <button
                onClick={() => handleNavigation('#order')}
                className="text-sm font-medium text-[#11110a] nav-link-hover bg-transparent border-0 cursor-pointer"
              >
                Order
              </button>
              
              {/* Cart Icon */}
              <CartSheet>
                <div className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                  <ShoppingCart className="w-6 h-6 text-[#553d8f]" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-[#f9c2cd] text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                      {getTotalItems()}
                    </Badge>
                  )}
                </div>
              </CartSheet>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile Cart Icon */}
              <CartSheet>
                <div className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                  <ShoppingCart className="w-6 h-6 text-[#553d8f]" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-[#f9c2cd] text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                      {getTotalItems()}
                    </Badge>
                  )}
                </div>
              </CartSheet>
              
              {/* Burger Menu Button */}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-[#553d8f] transition-transform duration-200" />
                ) : (
                  <Menu className="w-6 h-6 text-[#553d8f] transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="mt-4 pb-4 border-t border-white/20 relative z-10">
              <nav className="flex flex-col gap-4 mt-4">
                <button
                  onClick={() => {
                    handleNavigation('#products');
                    toggleMenu();
                  }}
                  className="text-sm font-medium text-[#11110a] hover:text-[#553d8f] transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50 bg-transparent border-0 cursor-pointer text-left"
                >
                  Products
                </button>
                <Link
                  to="/faq"
                  className="text-sm font-medium text-[#11110a] hover:text-[#553d8f] transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  FAQ
                </Link>
                <Link
                  to="/ingredients"
                  className="text-sm font-medium text-[#11110a] hover:text-[#553d8f] transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Ingredients
                </Link>
                <Link
                  to="/our-story"
                  className="text-sm font-medium text-[#11110a] hover:text-[#553d8f] transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Our Story
                </Link>
                <button
                  onClick={() => {
                    handleNavigation('#order');
                    toggleMenu();
                  }}
                  className="text-sm font-medium text-[#11110a] hover:text-[#553d8f] transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50 bg-transparent border-0 cursor-pointer text-left"
                >
                  Order
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}