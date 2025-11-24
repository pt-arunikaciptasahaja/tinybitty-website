// AddressSearchInput.tsx - Clean React component for address search with Nominatim

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { searchLocations, GeocodingResult, DistanceResult, calculateDistanceKm, getOrigin } from '@/lib/nominatimClient';

interface AddressSearchInputProps {
  onSelect: (result: DistanceResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface SearchState {
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
}

export default function AddressSearchInput({ 
  onSelect, 
  placeholder = "Ketik nama area atau kode pos…",
  disabled = false,
  className = ""
}: AddressSearchInputProps) {
  // Component state
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    error: null,
    hasSearched: false
  });

  // Refs for managing debouncing and cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Perform the actual search with proper cleanup
   */
  const performSearch = useCallback(async (searchQuery: string) => {
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this search
    abortControllerRef.current = new AbortController();

    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchState(prev => ({ ...prev, isSearching: false, error: null, hasSearched: false }));
      return;
    }

    setSearchState(prev => ({ ...prev, isSearching: true, error: null, hasSearched: true }));

    try {
      console.log(`[ADDRESS INPUT] Searching for: "${searchQuery}"`);
      
      const results = await searchLocations(searchQuery);
      
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      
      if (results.length === 0) {
        setSearchState(prev => ({ 
          ...prev, 
          isSearching: false, 
          error: "Lokasi tidak ditemukan, coba ketik nama area lain.",
          hasSearched: true 
        }));
      } else {
        setSearchState(prev => ({ ...prev, isSearching: false, error: null }));
      }
      
    } catch (error) {
      console.error('[ADDRESS INPUT] Search error:', error);
      
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: "Terjadi kesalahan saat mencari lokasi.",
        hasSearched: true 
      }));
    }
  }, []);

  /**
   * Debounced search handler
   */
  const debouncedSearch = useCallback((searchQuery: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for 500ms debounce (as per specification)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
  }, [performSearch]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchState(prev => ({ ...prev, isSearching: false, error: null, hasSearched: false }));
      return;
    }
    
    debouncedSearch(value);
  }, [debouncedSearch]);

  /**
   * Handle suggestion selection
   */
  const handleSelectSuggestion = useCallback((suggestion: GeocodingResult) => {
    console.log('[ADDRESS INPUT] Selected suggestion:', suggestion);
    
    // Calculate distance from origin
    const origin = getOrigin();
    const distanceKm = calculateDistanceKm(origin, {
      lat: suggestion.lat,
      lng: suggestion.lng
    });
    
    // Create distance result
    const distanceResult: DistanceResult = {
      destination: suggestion,
      distanceKm
    };
    
    // Update UI state
    setQuery(suggestion.label);
    setShowSuggestions(false);
    setSearchState({ isSearching: false, error: null, hasSearched: true });
    
    // Call parent callback
    onSelect(distanceResult);
  }, [onSelect]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      // Select first suggestion on Enter
      handleSelectSuggestion(suggestions[0]);
    }
  }, [suggestions, handleSelectSuggestion]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Close suggestions when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Element) {
        const target = event.target as Element;
        if (!target.closest('.address-search-container')) {
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative address-search-container ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>
        
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pl-10 pr-10 rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
        />
        
        {/* Loading Indicator */}
        {searchState.isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            <Loader2 className="w-4 h-4 text-[#BFAAE3] animate-spin" />
          </div>
        )}
      </div>

      {/* Status Messages */}
      {searchState.error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {searchState.error}
        </div>
      )}

      {/* Loading State */}
      {searchState.isSearching && (
        <div className="mt-2 text-sm text-[#8978B4] bg-[#BFAAE3]/10 rounded-lg p-2">
          Mencari lokasi…
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#D8CFF7] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.lat}-${suggestion.lng}-${index}`}
              className="p-3 hover:bg-[#F6F2FF] cursor-pointer border-b border-[#D8CFF7]/20 last:border-b-0 transition-colors duration-150"
              onClick={() => handleSelectSuggestion(suggestion)}
              role="option"
              aria-selected={index === 0}
            >
              {/* Main Label */}
              <div className="font-medium text-[#5D4E8E] text-sm flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#BFAAE3]" />
                {suggestion.label.split(',')[0]}
              </div>
              
              {/* Secondary Line - Full Address */}
              <div className="text-xs text-[#8978B4] mt-1 ml-5">
                {suggestion.label}
              </div>
              
              {/* Distance Info (for selected addresses) */}
              {/* <div className="text-xs text-[#BFAAE3] mt-1 ml-5">
                {calculateDistanceKm(getOrigin(), {
                  lat: suggestion.lat,
                  lng: suggestion.lng
                })} km dari lokasi kami
              </div> */}
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!searchState.isSearching && 
       searchState.hasSearched && 
       searchState.error === null && 
       query.trim().length >= 3 && 
       suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#D8CFF7] rounded-xl shadow-lg p-3">
          <div className="text-sm text-[#8978B4] text-center">
            Lokasi tidak ditemukan, coba ketik nama area lain.
          </div>
        </div>
      )}

      {/* Help Text */}
      {!searchState.hasSearched && query.length === 0 && (
        <div className="mt-2 text-xs text-[#8978B4]">
         💡 Ketik nama area (contoh: "Lebak Bulus") atau kode pos (contoh: "12430")
        </div>
      )}
    </div>
  );
}