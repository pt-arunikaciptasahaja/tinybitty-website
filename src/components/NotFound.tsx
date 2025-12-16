import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f5f7f7' }}>
      <div className="max-w-md w-full text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-[#553d8f] opacity-20">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-[#C5B8FF] to-[#553d8f] rounded-full opacity-10 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#553d8f] mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 mb-2">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <p className="text-sm text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#553d8f] text-white px-6 py-3 rounded-xl hover:bg-[#553d8f]/90 transition-all duration-200 font-medium"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-[#553d8f] hover:text-[#553d8f]/80 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            
            <span className="hidden sm:block text-gray-300">|</span>
            
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-[#553d8f] hover:text-[#553d8f]/80 transition-colors font-medium"
            >
              <Search className="w-4 h-4" />
              Check FAQ
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/#products"
              className="text-[#553d8f] hover:text-[#553d8f]/80 transition-colors"
              onClick={() => window.location.href = '/#products'}
            >
              Products
            </Link>
            <Link
              to="/ingredients"
              className="text-[#553d8f] hover:text-[#553d8f]/80 transition-colors"
            >
              Ingredients
            </Link>
            <Link
              to="/our-story"
              className="text-[#553d8f] hover:text-[#553d8f]/80 transition-colors"
            >
              Our Story
            </Link>
            <Link
              to="/#order"
              className="text-[#553d8f] hover:text-[#553d8f]/80 transition-colors"
              onClick={() => window.location.href = '/#order'}
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}