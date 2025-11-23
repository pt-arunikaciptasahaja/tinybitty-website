import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFormSchema } from '@/lib/validation';
import { OrderFormData } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { buildWhatsAppMessage, sendWhatsAppOrder } from '@/lib/whatsapp';
import { calculateShippingCost } from '@/lib/shippingService';
import { calculateDeliveryCost, formatDeliveryCost } from '@/lib/deliveryCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Lottie from 'lottie-react';
import remixAnimation from '@/data/Remix of assssa.json';
import { MessageCircle, CheckCircle2, Motorbike, MapPin, MapPinHouse, Timer, AlertCircle, ShoppingBag, Search, CreditCard, FileText, Lightbulb, CircleCheckBig, ClipboardCheck, PackageCheck, MessageSquareText, MessagesSquare, ExternalLink, UserCheck, ReceiptText, UserRoundPen, Smartphone, WalletCards, NotebookPen } from 'lucide-react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281112010160';

const getETA = (method: string): string => {
  switch (method.toLowerCase()) {
    case 'gosend':
      return '1-3 jam';
    case 'gosendsameday':
      return '3-6 jam';
    case 'grab':
      return '1-4 jam';
    case 'grabsameday':
      return '3-6 jam';
    case 'paxel':
      return '2-6 jam';
    default:
      return '1-3 jam';
  }
};

const capitalizeName = (name: string): string => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Helper function to convert text to camelCase
const toCamelCase = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => {
      // Handle words with dots, dashes, and numbers
      if (word.includes('.') || word.includes('-') || /^\d/.test(word)) {
        return word.toUpperCase();
      }
      // Regular words - capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

interface DeliveryInfo {
  cost: number;
  zone: string;
  time: string;
  formattedCost: string;
  isValid: boolean;
  validationError?: string;
}

export default function OrderForm() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  
  // Address search state for Gojek-style input
  const [addressSearch, setAddressSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
    address?: any;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  const [clearedFields, setClearedFields] = useState<Set<string>>(new Set());
  const [hasCompletedDeliveryCalculation, setHasCompletedDeliveryCalculation] = useState(false);
  const [hasCalculatedDelivery, setHasCalculatedDelivery] = useState(false);
  const [isDistanceTooFar, setIsDistanceTooFar] = useState(false);
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  
  // Debounced address calculation to prevent API calls on every keystroke
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addressSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Address extraction helper functions for OrderForm
  const extractSubdistrictFromAddress = useCallback((address: string): string => {
    const parts = address.split(',').map(p => p.trim());
    
    // Common patterns for Indonesian addresses
    // Try to find subdistrict (kelurahan/desa) + district (kecamatan) + city
    
    for (let i = 0; i < parts.length - 1; i++) {
      const current = parts[i].toLowerCase();
      const next = parts[i + 1].toLowerCase();
      
      // If current contains kelurahan/desa and next contains kecamatan, combine them
      if ((current.includes('kelurahan') || current.includes('desa')) && 
          (next.includes('kecamatan') || next.includes('district'))) {
        return `${parts[i]}, ${parts[i + 1]}`;
      }
      
      // If it's just the area name, combine with city
      if (next.includes('jakarta') || next.includes('depok') || next.includes('bogor')) {
        return `${parts[i]}, ${parts[i + 1]}`;
      }
    }
    
    // Fallback: use first 2-3 parts that contain location info
    const locationParts = parts.filter(part => 
      part.toLowerCase().includes('jakarta') || 
      part.toLowerCase().includes('depok') || 
      part.toLowerCase().includes('bogor') ||
      part.toLowerCase().includes('kecamatan') ||
      part.toLowerCase().includes('kelurahan')
    );
    
    return locationParts.slice(0, 2).join(', ');
  }, []);

  const extractCityFromAddress = useCallback((address: string): string => {
    const parts = address.split(',').map(p => p.trim());
    
    // Look for Jakarta, Depok, Bogor, etc.
    const cityPart = parts.find(part => 
      part.toLowerCase().includes('jakarta') || 
      part.toLowerCase().includes('depok') || 
      part.toLowerCase().includes('bogor') ||
      part.toLowerCase().includes('tangerang') ||
      part.toLowerCase().includes('bekasi')
    );
    
    return cityPart || parts[parts.length - 1]; // Fallback to last part
  }, []);

  const extractProvinceFromAddress = useCallback((address: string): string => {
    const addressLower = address.toLowerCase();
    
    if (addressLower.includes('jakarta') || addressLower.includes('depok') || addressLower.includes('bogor')) {
      return 'DKI Jakarta, Indonesia';
    }
    
    if (addressLower.includes('bandung')) {
      return 'Jawa Barat, Indonesia';
    }
    
    if (addressLower.includes('surabaya')) {
      return 'Jawa Timur, Indonesia';
    }
    
    return 'Indonesia';
  }, []);

  // JSONP helper function for OrderForm
  const fetchWithJSONP = useCallback((url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
      const script = document.createElement('script');
      
      // Create callback function
      (window as any)[callbackName] = function(data: any) {
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        if (data && data.length > 0) {
          resolve(data);
        } else {
          reject(new Error('No data received'));
        }
      };
      
      // Set up error handling
      script.onerror = function() {
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        reject(new Error('JSONP request failed'));
      };
      
      // Add callback parameter
      const separator = url.includes('?') ? '&' : '?';
      const jsonpUrl = url + separator + 'callback=' + callbackName;
      
      script.src = jsonpUrl;
      document.head.appendChild(script);
      
      // Set timeout
      setTimeout(() => {
        if ((window as any)[callbackName]) {
          delete (window as any)[callbackName];
          document.head.removeChild(script);
          reject(new Error('JSONP request timeout'));
        }
      }, 10000);
    });
  }, []);

  // Enhanced Gojek-style address search with CORS proxy and retry logic
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      console.log(`[ADDRESS SEARCH] Query too short (${query.length} chars), skipping search`);
      setSearchSuggestions([]);
      return;
    }

    console.log(`[ADDRESS SEARCH] Starting search for: "${query}"`);
    setIsSearchingAddress(true);
    
    const searchWithRetry = async (searchQuery: string, retryCount = 0): Promise<any[]> => {
      const maxRetries = 3;
      const baseDelay = 500; // Start with 500ms delay
      
      // More reliable CORS proxy options with different approaches
      const corsProxies = [
        'https://corsproxy.io/?', // More reliable proxy
        'https://api.allorigins.win/raw?url=',
        null // Will use JSONP approach
      ];
      
      try {
        console.log(`[ADDRESS SEARCH] Attempt ${retryCount + 1}/${maxRetries + 1} for query: "${searchQuery}"`);
        
        // Enhanced search parameters focused on Java island only
        const searchParams = new URLSearchParams({
          format: 'json',
          q: searchQuery,
          limit: '5', // Increased from 3 to 5 for better options
          addressdetails: '1',
          countrycodes: 'id',
          'accept-language': 'id,en',
          featuretype: 'place,highway', // Focus on places and roads
          // Java island bounding box: 105.0°E to 114.6°E, 5.9°S to 7.8°N
          bounded: '1',
          viewbox: '105.0,-7.8,114.6,5.9'
        });
        
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?${searchParams}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        let response: Response;
        let proxyIndex = 0;
        let lastError: any;
        
        // Try with CORS proxies
        while (proxyIndex < corsProxies.length) {
          try {
            // Handle JSONP approach
            if (proxyIndex === 2 && corsProxies[2] === null) {
              console.log(`Trying JSONP approach...`);
              const jsonpResult = await fetchWithJSONP(nominatimUrl);
              if (jsonpResult) {
                // Convert JSONP result to response-like object
                response = {
                  ok: true,
                  status: 200,
                  json: () => Promise.resolve(jsonpResult)
                } as Response;
                console.log(`JSONP successful!`);
                break;
              } else {
                throw new Error('JSONP failed');
              }
            } else {
              const proxyUrl = corsProxies[proxyIndex] + encodeURIComponent(nominatimUrl);
              
              console.log(`Trying CORS proxy ${proxyIndex + 1}/${corsProxies.length}...`);
              
              response = await fetch(proxyUrl, {
                headers: {
                  'User-Agent': 'TinyBitty-Cookie/1.0',
                  'Accept': 'application/json'
                },
                signal: controller.signal
              });
              
              if (response.ok) {
                console.log(`CORS proxy ${proxyIndex + 1} successful!`);
                break;
              } else {
                lastError = new Error(`Proxy ${proxyIndex + 1} failed with status: ${response.status}`);
                proxyIndex++;
              }
            }
          } catch (proxyError) {
            console.warn(`Method ${proxyIndex + 1} failed:`, proxyError);
            lastError = proxyError;
            proxyIndex++;
          }
        }
        
        clearTimeout(timeoutId);
        
        if (!response || !response.ok) {
          throw lastError || new Error('All CORS proxies failed');
        }
        
        const data = await response.json();
        
        // Filter and enhance results
        const enhancedResults = data
          .filter((item: any) => item.address && item.lat && item.lon)
          .map((item: any) => ({
            ...item,
            // Add confidence score based on result quality
            confidence: calculateConfidenceScore(item)
          }))
          .sort((a: any, b: any) => b.confidence - a.confidence); // Sort by confidence
        
        return enhancedResults;
      } catch (error) {
        console.warn(`Address search attempt ${retryCount + 1} failed:`, error);
        
        // Special handling for CORS errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.log('CORS error detected, this is expected in browser environments');
        }
        
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return searchWithRetry(searchQuery, retryCount + 1);
        }
        
        throw error;
      }
    };
    
    // Helper function to calculate confidence score for results
    const calculateConfidenceScore = (item: any) => {
      let score = 0;
      
      // Boost score for complete addresses
      if (item.address.house_number) score += 10;
      if (item.address.road) score += 8;
      if (item.address.suburb || item.address.neighbourhood) score += 6;
      if (item.address.city || item.address.town || item.address.village) score += 4;
      if (item.address.state) score += 2;
      
      // Boost for certain place types
      if (item.type === 'place' && item.class === 'place') score += 5;
      if (item.type === 'highway') score += 3;
      
      // Boost for populated areas (higher importance)
      if (item.importance && item.importance > 0.5) score += 3;
      
      return score;
    };
    
    // Fallback search strategies
    const tryFallbackSearches = async (originalQuery: string): Promise<any[]> => {
      const fallbacks = [
        // Try with "Jakarta" appended if not already present
        originalQuery.includes('Jakarta') ? originalQuery : `${originalQuery}, Jakarta`,
        // Try with common Indonesian city suffixes
        `${originalQuery}, Indonesia`,
        // Try without special characters
        originalQuery.replace(/[,.]/g, ' ')
      ];
      
      for (const fallbackQuery of fallbacks) {
        try {
          const results = await searchWithRetry(fallbackQuery);
          if (results.length > 0) {
            console.log(`Fallback search successful with query: ${fallbackQuery}`);
            return results;
          }
        } catch (error) {
          console.warn(`Fallback search failed for query: ${fallbackQuery}`, error);
        }
      }
      
      return [];
    };
    
    try {
      // Try progressively simpler address versions for better success rate
      const addressVersions = [
        query.trim().replace(/\s+/g, ' '), // Original cleaned query
        extractSubdistrictFromAddress(query),
        extractCityFromAddress(query),
        extractProvinceFromAddress(query),
        "Jakarta, Indonesia" // Final fallback
      ];
      
      // Remove duplicates and empty strings
      const uniqueQueries = [...new Set(addressVersions.filter(q => q && q.trim()))];
      console.log(`[ADDRESS SEARCH] Will try ${uniqueQueries.length} address variations for: "${query}"`);
      
      let results: any[] = [];
      
      // Try each address variation until we get results
      for (const addressVersion of uniqueQueries) {
        console.log(`[ADDRESS SEARCH] Trying: "${addressVersion}"`);
        
        try {
          const searchResults = await searchWithRetry(addressVersion);
          if (searchResults.length > 0) {
            console.log(`[ADDRESS SEARCH] Success with simplified address: "${addressVersion}"`);
            results = searchResults;
            break;
          }
        } catch (searchError) {
          console.log(`[ADDRESS SEARCH] Failed for "${addressVersion}":`, searchError);
        }
      }
      
      // If still no results, try the fallback searches
      if (results.length === 0) {
        console.log('No results from progressive simplification, trying fallback searches...');
        results = await tryFallbackSearches(query);
      }
      
      // Final fallback: provide some helpful suggestions
      if (results.length === 0) {
        console.log('[ADDRESS SEARCH] All search attempts failed, providing manual entry guidance');
        console.log('[ADDRESS SEARCH] Note: This could be due to CORS restrictions in browser environments');
        results = [{
          display_name: 'Ketik alamat lengkap secara manual',
          lat: null,
          lon: null,
          address: null,
          confidence: 0,
          isManual: true,
          isFallback: true
        } as any];
      }
      
      console.log(`[ADDRESS SEARCH] Returning ${results.length} results for query: "${query}"`);
      setSearchSuggestions(results);
    } catch (error) {
      console.error('[ADDRESS SEARCH] All address search attempts failed:', error);
      
      // Check if it's a CORS error
      const isCorsError = error instanceof TypeError && 
                         (error.message.includes('Failed to fetch') || 
                          error.message.includes('CORS') ||
                          error.message.includes('blocked'));
      
      if (isCorsError) {
        console.warn('[ADDRESS SEARCH] CORS error detected - this is expected when calling OpenStreetMap API directly from browser');
        console.warn('[ADDRESS SEARCH] Consider using a CORS proxy or implementing server-side proxy');
      }
      
      // Graceful degradation - show manual entry option
      const fallbackSuggestion = {
        display_name: 'Ketik alamat lengkap secara manual',
        lat: null,
        lon: null,
        address: null,
        confidence: 0,
        isManual: true,
        isFallback: true,
        error: isCorsError 
          ? 'CORS: Gunakan proxy atau server-side solution untuk akses API'
          : 'Pencarian alamat gagal, silakan ketik alamat manual'
      } as any;
      
      console.log('[ADDRESS SEARCH] Showing manual entry fallback');
      setSearchSuggestions([fallbackSuggestion]);
    } finally {
      setIsSearchingAddress(false);
    }
  }, []);

  // Debounced address search
  const debouncedAddressSearch = useCallback(() => {
    if (addressSearchTimeoutRef.current) {
      clearTimeout(addressSearchTimeoutRef.current);
    }
    
    addressSearchTimeoutRef.current = setTimeout(() => {
      searchAddress(addressSearch);
    }, 500); // 500ms debounce
  }, [addressSearch, searchAddress]);

  // Handle selecting an address from suggestions
  const handleAddressSelect = useCallback((suggestion: any) => {
    // Auto-fill the address fields based on the selected suggestion
    const address = suggestion.address;
    const fullAddress = suggestion.display_name;
    
    // Update the search field
    setAddressSearch(fullAddress);
    setShowSuggestions(false);
    
    // Try to extract administrative hierarchy if available
    if (address) {
      const province = address.state || address.province || '';
      const regency = address.city || address.regency || address.town || '';
      const district = address.county || address.suburb || address.neighbourhood || '';
      
      // console.log('📍 [ADDRESS SELECTOR] Extracted administrative data:', { province, regency, district });
      
      // Update form fields
      if (province) form.setValue('provinsi', province);
      if (regency) form.setValue('kota', regency);
      if (district) form.setValue('kecamatan', district);
    }
    
    // Store coordinates for future use
    form.setValue('address', fullAddress);
    
    // Reset delivery calculation since address changed
    setHasCompletedDeliveryCalculation(false);
    setDeliveryInfo(null);
    setIsDistanceTooFar(false);
    setDeliveryDistance(null);
    setClearedFields(new Set(['deliveryMethod', 'paymentMethod']));
    form.setValue('deliveryMethod', undefined);
    form.setValue('paymentMethod', undefined);
  }, []);

  // Handle delivery method change - this is when we trigger ongkir calculation
  const handleDeliveryMethodChange = useCallback((method: string) => {
    form.setValue('deliveryMethod', method as any);
    
    // Log shipping calculator trigger
    // console.log('🚚 [SHIPPING CALCULATOR] Delivery method selected:', method);
    
    // If user selects Paxel, clear the distance too far state
    if (method === 'paxel') {
      setIsDistanceTooFar(false);
      setDeliveryDistance(null);
      setDeliveryInfo(null); // Clear any existing delivery info
      setHasCompletedDeliveryCalculation(false);
    }
    
    // Force form validation to reset to avoid timing issues
    form.trigger('paymentMethod');
    
    // Trigger delivery calculation only when delivery method is selected (not for Paxel)
    const address = form.getValues('address') || addressSearch;
    const detailedAddress = form.getValues('detailedAddress');
    
    if (address && method && method !== 'paxel') {
      // console.log('🚚 [SHIPPING CALCULATOR] Starting calculation for:', { address, method, detailedAddress });
      calculateDeliveryForAddress(address, method, detailedAddress);
    }
  }, []);

  // Separate function for delivery calculation (only triggered on delivery method selection)
  const calculateDeliveryForAddress = useCallback(async (address: string, method: string, detailedAddress?: string) => {
    // console.log('🚚 [SHIPPING CALCULATOR] Cart total:', getTotalPrice());
    
    setIsCalculatingDelivery(true);
    let calculationSuccess = false;
    
    try {
      // console.log('🚚 [SHIPPING CALCULATOR] Attempting primary calculation...');
      // Use the existing ongkir calculation logic
      const calculation = await calculateShippingCost(address, method, cart);
      
      if (!calculation.isValidAddress) {
        console.log('[SHIPPING CALCULATOR] Primary calculation failed: Invalid address');
        const info = {
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Address not found',
          isValid: false,
          validationError: 'No worries! ongkirnya nanti dikonfirmasi via WhatsApp ya!'
        };
        setDeliveryInfo(info);
        calculationSuccess = false;
        return;
      }
      
      console.log('[SHIPPING CALCULATOR] Primary calculation successful:', calculation);
      
      // Extract distance from zone name
      const distanceMatch = calculation.zone.name.match(/(\d+\.?\d*)\s*km/i);
      const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
      setDeliveryDistance(distance);
      
      // Check if any GoSend/Grab method is selected and distance > 40km
      const isGoSendGrabMethod = method.includes('gosend') || method.includes('grab');
      
      // Check if delivery is not available due to distance > 40km
      if (isGoSendGrabMethod && distance > 40) {
        // Remove calculator display and show Paxel alternative
        setDeliveryInfo(null);
        setHasCompletedDeliveryCalculation(false);
        setIsDistanceTooFar(true);
        console.log('[SHIPPING CALCULATOR] GoSend/Grab delivery not available due to distance - showing Paxel alternative:', { method, distance });
        
        // Show toast notification about Paxel alternative
        toast({
          title: 'Maaf layanan ini tidak tersedia untuk GoSend/GrabExpress',
          description: `Jarak pengiriman ${distance.toFixed(1)}km melebihi batas 40km. Silakan gunakan Paxel untuk pengiriman.`,
          variant: 'default',
        });
        calculationSuccess = false;
      } else {
        const formattedCost = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(calculation.cost);
        
        const estimatedTime = getETA(method);
        
        const info = {
          cost: calculation.cost,
          zone: calculation.zone.name,
          time: estimatedTime,
          formattedCost: formattedCost,
          isValid: true
        };
        setDeliveryInfo(info);
        
        // Only clear distance too far state if it's not a GoSend/Grab method for far distance
        if (!isGoSendGrabMethod || distance <= 40) {
          setIsDistanceTooFar(false);
        }
        
        calculationSuccess = true;
        setHasCompletedDeliveryCalculation(true);
        console.log('[SHIPPING CALCULATOR] Delivery info set:', info);
      }
    } catch (error) {
      console.log('[SHIPPING CALCULATOR] Primary calculation error:', error);
      try {
        console.log('[SHIPPING CALCULATOR] Attempting fallback calculation...');
        const fallbackCalculation = calculateDeliveryCost(address, method, cart, getTotalPrice());
        
        // Check for distance limit exceeded (for all GoSend/Grab methods) in fallback too
        const isGoSendGrabMethod = method.includes('gosend') || method.includes('grab');
        const distanceMatch = fallbackCalculation.zone.name.match(/(\d+\.?\d*)\s*km/i);
        const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
        setDeliveryDistance(distance);
        
        // Check if GoSend/Grab delivery is not available due to distance > 40km
        if (isGoSendGrabMethod && distance > 40) {
          // Remove calculator display and show Paxel alternative
          setDeliveryInfo(null);
          setHasCompletedDeliveryCalculation(false);
          setIsDistanceTooFar(true);
          console.log('[SHIPPING CALCULATOR] Fallback: GoSend/Grab delivery not available due to distance - showing Paxel alternative:', { method, distance });
          
          // Show toast notification about Paxel alternative
          toast({
            title: 'Maaf layanan ini tidak tersedia untuk gojek/grab',
            description: `Jarak pengiriman ${distance.toFixed(1)}km melebihi batas 40km. Silakan gunakan Paxel untuk pengiriman.`,
            variant: 'default',
          });
          calculationSuccess = false;
        } else {
          const info = {
            cost: fallbackCalculation.cost,
            zone: fallbackCalculation.zone.name,
            time: fallbackCalculation.estimatedTime,
            formattedCost: formatDeliveryCost(fallbackCalculation.cost),
            isValid: true
          };
          setDeliveryInfo(info);
          
          // Only clear distance too far state if it's not a GoSend/Grab method for far distance
          if (!isGoSendGrabMethod || distance <= 40) {
            setIsDistanceTooFar(false);
          }
          
          calculationSuccess = true;
          setHasCompletedDeliveryCalculation(true);
          console.log('[SHIPPING CALCULATOR] Fallback calculation successful:', info);
        }
      } catch (fallbackError) {
        console.log('[SHIPPING CALCULATOR] Fallback calculation failed:', fallbackError);
        const info = {
          cost: 0,
          zone: 'Error',
          time: 'N/A',
          formattedCost: 'Error calculating delivery',
          isValid: false,
          validationError: 'Gagal menghitung ongkir. Ongkir akan dikonfirmasi via WhatsApp.'
        };
        setDeliveryInfo(info);
        calculationSuccess = false;
        setHasCompletedDeliveryCalculation(false);
      }
    } finally {
      setIsCalculatingDelivery(false);
      if (calculationSuccess) {
        setHasCompletedDeliveryCalculation(true);
      }
      setHasCalculatedDelivery(calculationSuccess);
      console.log('[SHIPPING CALCULATOR] Calculation completed. Success:', calculationSuccess);
    }
  }, []);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      provinsi: 'DKI Jakarta',
      kota: '',
      kecamatan: '',
      kelurahan: '',
      detailedAddress: '',
      deliveryMethod: undefined,
      paymentMethod: undefined,
      notes: '',
    },
  });

  // Watch for changes in address and delivery method to calculate delivery cost
  const detailedAddress = form.watch('detailedAddress');
  const deliveryMethod = form.watch('deliveryMethod');
  const paymentMethod = form.watch('paymentMethod');

  // Trigger address search when user types
  useEffect(() => {
    if (addressSearch.length >= 3) {
      debouncedAddressSearch();
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [addressSearch, debouncedAddressSearch]);

  // Generate full address for display purposes (includes detailed address)
  const generateFullAddress = useCallback(() => {
    const addressField = form.watch('address');
    const detailedAddressField = form.watch('detailedAddress');
    
    // Build address from search-based system
    const parts = [];
    
    // Add main address from search
    if (addressField && addressField.trim()) {
      parts.push(toCamelCase(addressField.trim()));
    }
    
    // Add detailed address (street address, house number, etc.)
    if (detailedAddressField && detailedAddressField.trim()) {
      const normalizedAddress = detailedAddressField
        .trim()
        .replace(/\bjl\.?\b/gi, 'Jalan')
        .replace(/\bstreet\b/gi, 'Jalan')
        .replace(/\brt\.?\s*(\d+)/gi, 'RT $1')
        .replace(/\brw\.?\s*(\d+)/gi, 'RW $1')
        .replace(/\bno\.?\s*(\d+)/gi, 'No $1')
        .trim();
      parts.push(toCamelCase(normalizedAddress));
    }
    
    return parts.join(', ');
  }, [form]);

  // Debounced function for delivery calculation
  const debouncedDeliveryCalculation = useCallback(() => {
    // console.log('🔵 [DEBOUNCE] debouncedDeliveryCalculation called');
    
    // Skip calculation if already completed - this prevents the overwrite issue
    if (hasCompletedDeliveryCalculation) {
      // console.log('🟢 [DEBOUNCE] Skipping calculation - already completed');
      return;
    }
    
    // Clear existing timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }

    // Set new timeout for 2 seconds to debounce API calls
    calculationTimeoutRef.current = setTimeout(() => {
      // console.log('🔵 [DEBOUNCE 1] Timeout fired - checking current state');
      
      // Check again inside timeout - calculation might have completed while waiting
      if (hasCompletedDeliveryCalculation || deliveryInfo?.isValid) {
        // console.log('🟢 [DEBOUNCE] Skipping timeout logic - calculation already completed');
        return;
      }
      
      // console.log('🔵 [DEBOUNCE 2] Timeout fired - starting calculation logic');
      // Use the new address system check (same as step completion logic)
      const isAddressComplete = (form.watch('address') && form.watch('address').trim().length >= 8) &&
        (detailedAddress && detailedAddress.trim().length >= 8);
      
      // Generate address for API calls - use the search-based address
      const fullAddress = form.watch('address') || '';
      
      // console.log('🔵 [DEBOUNCE 3] Calculation conditions:', {
      //   isAddressComplete,
      //   deliveryMethod,
      //   hasCompletedDeliveryCalculation,
      //   addressLength: fullAddress.length,
      //   detailedAddressLength: detailedAddress?.trim().length
      // });
      
      // Only calculate delivery if address is complete, delivery method is selected,
      // and we haven't already calculated delivery for this specific combination
      // Skip calculation for Paxel as it uses external calculator
      if (isAddressComplete && deliveryMethod && deliveryMethod !== 'paxel' && !hasCompletedDeliveryCalculation) {
        console.log('🟢 [DEBOUNCE] Starting new delivery calculation');
        const calculateNewDelivery = async () => {
          setIsCalculatingDelivery(true);
          let calculationSuccess = false;
          
          try {
            const calculation = await calculateShippingCost(fullAddress, deliveryMethod, cart);
            
            if (!calculation.isValidAddress) {
              const info = {
                cost: 0,
                zone: '',
                time: '',
                formattedCost: 'Address not found',
                isValid: false,
                validationError: 'No worries! ongkirnya nanti dikonfirmasi via whatsapp ya!'
              };
              setDeliveryInfo(info);
              calculationSuccess = false;
              return;
            }
            
            // Extract distance from calculation result
            const distanceMatch = calculation.zone.name.match(/(\d+\.?\d*)\s*km/i);
            const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
            setDeliveryDistance(distance);
            
            // Check if GoSend/Grab delivery is not available due to distance > 40km
            const isGoSendGrabMethod = deliveryMethod.includes('gosend') || deliveryMethod.includes('grab');
            if (isGoSendGrabMethod && distance > 40) {
              setDeliveryInfo(null);
              setHasCompletedDeliveryCalculation(false);
              setIsDistanceTooFar(true);
              console.log('🟠 [CALC] Debounced: GoSend/Grab delivery not available due to distance - showing Paxel alternative:', { deliveryMethod, distance });
              calculationSuccess = false;
            } else {
              const formattedCost = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(calculation.cost);
              
              const estimatedTime = getETA(deliveryMethod);
              
              const info = {
                cost: calculation.cost,
                zone: calculation.zone.name,
                time: estimatedTime,
                formattedCost: formattedCost,
                isValid: true
              };
              console.log('🟢 [CALC] Setting deliveryInfo with successful calculation:', info);
              setDeliveryInfo(info);
              
              // Only clear distance too far state if it's not a GoSend/Grab method for far distance
              if (!isGoSendGrabMethod || distance <= 40) {
                setIsDistanceTooFar(false);
              }
              
              calculationSuccess = true;
              setHasCompletedDeliveryCalculation(true);
            }
          } catch (error) {
            try {
              const fallbackCalculation = calculateDeliveryCost(fullAddress, deliveryMethod, cart, getTotalPrice());
              
              // Check distance in fallback calculation too
              const distanceMatch = fallbackCalculation.zone.name.match(/(\d+\.?\d*)\s*km/i);
              const distance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
              setDeliveryDistance(distance);
              
              const isGoSendGrabMethod = deliveryMethod.includes('gosend') || deliveryMethod.includes('grab');
              if (isGoSendGrabMethod && distance > 40) {
                setDeliveryInfo(null);
                setHasCompletedDeliveryCalculation(false);
                setIsDistanceTooFar(true);
                console.log('🟠 [CALC] Fallback: GoSend/Grab delivery not available due to distance - showing Paxel alternative:', { deliveryMethod, distance });
                calculationSuccess = false;
              } else {
                const info = {
                  cost: fallbackCalculation.cost,
                  zone: fallbackCalculation.zone.name,
                  time: fallbackCalculation.estimatedTime,
                  formattedCost: formatDeliveryCost(fallbackCalculation.cost),
                  isValid: true
                };
                setDeliveryInfo(info);
                
                // Only clear distance too far state if it's not a GoSend/Grab method for far distance
                if (!isGoSendGrabMethod || distance <= 40) {
                  setIsDistanceTooFar(false);
                }
                
                calculationSuccess = true;
                setHasCompletedDeliveryCalculation(true);
              }
            } catch (fallbackError) {
              const info = {
                cost: 0,
                zone: 'Error',
                time: 'N/A',
                formattedCost: 'Error calculating delivery',
                isValid: false,
                validationError: 'Gagal menghitung ongkir. Ongkir akan dikonfirmasi via WhatsApp.'
              };
              setDeliveryInfo(info);
              calculationSuccess = false;
              setHasCompletedDeliveryCalculation(false);
            }
          } finally {
            setIsCalculatingDelivery(false);
            // Mark that delivery has been calculated successfully
            if (calculationSuccess) {
              setHasCompletedDeliveryCalculation(true);
            }
            setHasCalculatedDelivery(calculationSuccess);
          }
        };

        calculateNewDelivery();
      } else if (isAddressComplete && !deliveryMethod) {
        // console.log('🟡 [DEBOUNCE] Setting deliveryInfo - address complete but no delivery method');
        const info = {
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Select delivery method',
          isValid: false,
          validationError: 'Please select a delivery method'
        };
        setDeliveryInfo(info);
      } else if (!isAddressComplete && deliveryMethod) {
        // Keep the calculator visible when delivery method is selected but address is incomplete
        // console.log('🟡 [DEBOUNCE] Setting deliveryInfo - delivery method selected but address incomplete');
        const info = {
          cost: 0,
          zone: '',
          time: '',
          formattedCost: 'Complete your address',
          isValid: false,
          validationError: 'Please complete your address to calculate delivery cost'
        };
        setDeliveryInfo(info);
      } else if (!isAddressComplete && !deliveryMethod) {
        // Clear calculator only when both address and delivery method are incomplete
        // console.log('🔴 [DEBOUNCE] Clearing deliveryInfo - no address and no delivery method');
        setDeliveryInfo(null);
      }
    }, 2000); // 2 second debounce
  }, [detailedAddress, deliveryMethod, hasCompletedDeliveryCalculation, cart, getTotalPrice, form, deliveryInfo?.isValid]);

  useEffect(() => {
    // Only trigger calculation if all fields are complete (using new address system)
    const isAddressComplete = (form.watch('address') && form.watch('address').trim().length >= 8) &&
      (detailedAddress && detailedAddress.trim().length >= 8);
    
    // console.log('🔵 [USEEFFECT] Delivery calculation useEffect triggered', {
    //   isAddressComplete,
    //   deliveryMethod,
    //   hasCompletedDeliveryCalculation
    // });
    
    if (isAddressComplete || deliveryMethod) {
      // console.log('🔵 [USEEFFECT] Calling debouncedDeliveryCalculation');
      debouncedDeliveryCalculation();
    } else {
      // Clear any pending calculations if address is incomplete
      // console.log('🔴 [USEEFFECT] Clearing deliveryInfo - address incomplete and no delivery method');
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
        calculationTimeoutRef.current = null;
      }
      setDeliveryInfo(null);
    }
  }, [debouncedDeliveryCalculation]);

  const handleWhatsAppRedirect = () => {
    if (!orderData) return;
    
    const message = buildWhatsAppMessage(orderData, cart, orderTotal, deliveryInfo?.cost || 0, isDistanceTooFar, deliveryDistance);
    
    sendWhatsAppOrder(message, WHATSAPP_NUMBER);
    
    setShowThankYouModal(false);
    setOrderData(null);
    setOrderTotal(0);
    setDeliveryInfo(null);
    clearCart();
    form.reset();
    
    toast({
      title: 'WhatsApp opened!',
      description: 'Please send the message to complete your order',
    });
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }, 1000);
  };

  const onSubmit = (data: OrderFormData) => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add products to cart first',
        variant: 'destructive',
      });
      return;
    }

    const fullAddress = generateFullAddress();
    // Allow orders even if delivery calculation fails - will be confirmed via WhatsApp

    if (!deliveryMethod) {
      toast({
        title: 'Delivery method required',
        description: 'Please select a delivery method',
        variant: 'destructive',
      });
      return;
    }

    setOrderData(data);
    setCustomerName(data.name);
    setOrderTotal(getTotalPrice());

    setShowConfirmationModal(true);
  };

  const handleConfirmOrder = () => {
    setShowConfirmationModal(false);
    setShowThankYouModal(true);
  };

  const handleEditOrder = () => {
    setShowConfirmationModal(false);
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const { isValid, errors } = form.formState;
  
  const isStep1Complete = form.watch('name') && form.watch('phone') &&
    form.watch('name').trim() !== '' && form.watch('phone').trim() !== '';
  
  const isAddressComplete = (form.watch('address') && form.watch('address').trim().length >= 8) &&
    (detailedAddress && detailedAddress.trim().length >= 8);
  
  const isStep2Complete = isAddressComplete;
  const isStep3Complete = deliveryMethod && deliveryMethod.trim() !== '';
  const isStep4Complete = paymentMethod && paymentMethod.trim() !== '';
  
  const currentStep = !isStep1Complete ? 1 :
                     !isStep2Complete ? 2 :
                     !isStep3Complete ? 3 :
                     !isStep4Complete ? 4 : 4;
  
  // Calculate the next step more logically
  const getNextStep = () => {
    if (!isStep1Complete) return 1;
    if (!isStep2Complete) return 2;
    if (!isStep3Complete) return 3;
    if (!isStep4Complete) return 4;
    return 4; // All complete
  };
  
  const nextStep = getNextStep();
  
  const stepProgress = (currentStep - 1) / 4 * 100;

  return (
<section id="order" className="mb-12 md:mb-16 py-16 order-form-texture rounded-3xl">
  <div className="container mx-auto px-4 max-w-none">
    <Card className="border-2 border-[#D8CFF7]/40 shadow-2xl rounded-3xl overflow-hidden w-full md:w-1/2 md:mx-auto">
      <CardHeader className="bg-[#F6F2FF] border-b border-[#D8CFF7]/40">
        <CardTitle className="text-2xl font-bold text-[#5D4E8E] flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-[#BFAAE3]" />
          Form Pemesanan
        </CardTitle>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-[#8978B4] mb-2">
            <span>Langkah {currentStep} dari 4</span>
            <span>
              {currentStep === 4 && isStep4Complete ? 'Form selesai!' : 'Lengkapi dulu ya!'}
            </span>
          </div>
          <div className="w-full bg-[#D8CFF7]/20 rounded-full h-2">
            <div
              className="bg-[#BFAAE3] h-2 rounded-full transition-all duration-300"
              style={{ width: `${stepProgress + (currentStep === 4 ? 25 : 0)}%` }}
            ></div>
          </div>
        </div>
        <CardDescription className="text-[#8978B4]">
          {currentStep === 1 && 'Mulai dengan mengisi nama dan nomor WhatsApp kamu'}
          {currentStep === 2 && 'Lengkapi alamat pengiriman kamu'}
          {currentStep === 3 && 'Cek ongkir dan pilih kurir pengiriman'}
          {currentStep === 4 && 'Data kamu sudah lengkap, yuk lanjut order sekarang!'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Data Kontak */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-[#F6F2FF] border-[#D8CFF7]'
                  : isStep1Complete
                  ? 'bg-green-50 border-green-200'
                  : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isStep1Complete
                      ? 'bg-green-500 text-white'
                      : currentStep === 1
                      ? 'bg-[#BFAAE3] text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  1
                </div>
                <h3 className="font-semibold text-[#5D4E8E]">Data Kontak</h3>
                {isStep1Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className='mb-6'>
                    <FormLabel className="text-[#5D4E8E] flex items-center gap-2">
                    <UserRoundPen className="w-4 h-4" />
                      Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama lengkap kamu"
                        {...field}
                        className="rounded-xl text-[#5D4E8E] border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E] flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                      Nomor WhatsApp
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={15}
                        className="rounded-xl text-[#5D4E8E] border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
                        value={field.value}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, '');
                          field.onChange(onlyDigits);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <p className="text-xs text-[#8978B4] mt-1">
                      Hanya nomor Indonesia (0 atau 62 di depan), tanpa spasi atau simbol.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2: Alamat Pengiriman */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                currentStep === 2
                  ? 'bg-[#F6F2FF] border-[#D8CFF7]'
                  : isStep2Complete
                  ? 'bg-green-50 border-green-200'
                  : !isStep1Complete
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isStep2Complete
                      ? 'bg-green-500 text-white'
                      : currentStep === 2
                      ? 'bg-[#BFAAE3] text-white'
                      : !isStep1Complete
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-[#D8CFF7] text-[#5D4E8E]'
                  }`}
                >
                  2
                </div>
                <h3 className="font-semibold text-[#5D4E8E] flex items-center gap-2">
                  {/* <MapPin className="w-4 h-4" /> */}
                  Alamat Lengkap
                </h3>
                {isStep2Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>

              {/* Gojek-style Address Search */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="text-[#5D4E8E] flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Alamat Pengantaran
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <div className="relative">
                          {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                          <Input
                            placeholder="Contoh: Pesona Khayangan"
                            {...field}
                            value={addressSearch || field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAddressSearch(value);
                              field.onChange(value);
                              setShowSuggestions(value.length >= 5);
                              setClearedFields(new Set(['deliveryMethod', 'paymentMethod']));
                              form.setValue('deliveryMethod', undefined);
                              form.setValue('paymentMethod', undefined);
                              setHasCompletedDeliveryCalculation(false);
                              setDeliveryInfo(null);
                              setIsDistanceTooFar(false);
                              setDeliveryDistance(null);
                            }}
                            className="rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
                            disabled={!isStep1Complete}
                          />
                          {isSearchingAddress && (
                            <div className="absolute right-3 top-3">
                              <div className="w-4 h-4 border-2 border-[#BFAAE3]/30 border-t-[#BFAAE3] rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      
                      {/* Address Suggestions Dropdown */}
                      {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-[#D8CFF7] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {searchSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-3 hover:bg-[#F6F2FF] cursor-pointer border-b border-[#D8CFF7]/20 last:border-b-0"
                              onClick={() => handleAddressSelect(suggestion)}
                            >
                              <div className="font-medium text-[#5D4E8E] text-sm flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {suggestion.display_name.split(',')[0]}
                              </div>
                              <div className="text-xs text-[#8978B4] mt-1">
                                {suggestion.display_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Detail Alamat (Mandatory) */}
              <FormField
                control={form.control}
                name="detailedAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E] flex items-center gap-2">
                      <MapPinHouse className="w-4 h-4" />
                      Detail Alamat (Wajib)
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Blok ABC No. 123"
                        {...field}
                        disabled={!isStep1Complete}
                        className="rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white min-h-[80px] placeholder:text-gray-400"
                        onChange={(e) => {
                          field.onChange(e);
                          setClearedFields(new Set(['deliveryMethod', 'paymentMethod']));
                          form.setValue('deliveryMethod', undefined);
                          form.setValue('paymentMethod', undefined);
                          setHasCompletedDeliveryCalculation(false);
                          setDeliveryInfo(null);
                          setIsDistanceTooFar(false);
                          setDeliveryDistance(null);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-[#8978B4] flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Detail alamat diperlukan untuk akurasi pengiriman (nomor rumah, RT/RW, lantai, dll)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Detailed Address Input */}
              {/* <FormField
                control={form.control}
                name="detailedAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5D4E8E]">
                      Detail Alamat (Jalan, Nomor Rumah, dll)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Jl. Kemang Raya No. 123 RT 001 RW 002"
                        {...field}
                        disabled={!isStep1Complete}
                        className={`rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white min-h-[80px] placeholder:text-gray-400 ${
                          !isStep1Complete ? 'bg-gray-100 cursor-not-allowed' : ''
                        } ${
                          clearedFields.has('detailedAddress')
                            ? 'border-amber-300 bg-amber-50'
                            : ''
                        }`}
                        onChange={(e) => {
                          field.onChange(e);
                          if (clearedFields.has('detailedAddress') && e.target.value.trim()) {
                            setClearedFields((prev) => {
                              const updated = new Set(prev);
                              updated.delete('detailedAddress');
                              return updated;
                            });
                          }
                          // Reset delivery calculation flag when address changes
                          if (e.target.value.length < detailedAddress?.length && deliveryMethod) {
                            setHasCompletedDeliveryCalculation(false);
                            setDeliveryInfo(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

{/* Step 3: Cek Ongkir / Kurir */}
<div
  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
    currentStep === 3
      ? 'bg-[#F6F2FF] border-[#D8CFF7]'
      : isStep3Complete
      ? 'bg-green-50 border-green-200'
      : !isStep2Complete
      ? 'bg-gray-50 border-gray-200'
      : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
  }`}
>
  <div className="flex items-center gap-2 mb-3">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
        isStep3Complete
          ? 'bg-green-500 text-white'
          : currentStep === 3
          ? 'bg-[#BFAAE3] text-white'
          : !isStep2Complete
          ? 'bg-gray-300 text-gray-500'
          : 'bg-[#D8CFF7] text-[#5D4E8E]'
      }`}
    >
      3
    </div>
    <h3 className="font-semibold text-[#5D4E8E] flex items-center gap-2">
      {/* <Motorbike className="w-4 h-4" /> */}
      Cek Ongkir Dulu Yuk!
    </h3>
    {isStep3Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
  </div>

  <FormField
    control={form.control}
    name="deliveryMethod"
    render={({ field }) => (
      <FormItem>
        
        <FormLabel className="text-[#5D4E8E] flex items-center gap-2">
        <Motorbike className="w-4 h-4" />
          Pilih Kurir / Metode Pengiriman
        </FormLabel>
        <Select
          value={field.value || ''}
          onValueChange={(value) => {
            field.onChange(value);
            // Trigger ongkir calculation when delivery method is selected
            handleDeliveryMethodChange(value);
            setClearedFields((prev) => {
              const updated = new Set(prev);
              updated.delete('deliveryMethod');
              return updated;
            });
          }}
          disabled={!isStep2Complete || isCalculatingDelivery}
        >
          <FormControl>
            <SelectTrigger
              className={`rounded-xl border-[#D8CFF7]/40 bg-white ${
                !isStep2Complete ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${
                clearedFields.has('deliveryMethod')
                  ? 'border-amber-300 bg-amber-50'
                  : ''
              }`}
            >
              <SelectValue
                placeholder={
                  !isStep2Complete
                    ? 'Lengkapi alamat dulu'
                    : 'Pilih kurir / metode pengiriman'
                }
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="gosend">GoSend Instant</SelectItem>
            <SelectItem value="gosendsameday">GoSend SameDay</SelectItem>
            <SelectItem value="grab">GrabExpress Instant</SelectItem>
            <SelectItem value="grabsameday">GrabExpress SameDay</SelectItem>
            <SelectItem value="paxel">Paxel</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* WhatsApp Confirmation Notice */}
  {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-3">
    <div className="flex items-center gap-2 text-blue-700">
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm font-medium">💬 ONGKIR AKAN DIKONFIRMASI VIA WHATSAPP</span>
    </div>
    <p className="text-xs text-blue-600 mt-1 ml-6">
      Biaya pengiriman akan dikonfirmasi melalui WhatsApp setelah order diterima.
    </p>
  </div> */}
</div>

{/* Ongkir Display - Hide when distance is too far for GoSend/Grab OR when Paxel is selected */}
{(deliveryInfo || isCalculatingDelivery || deliveryMethod) && !isDistanceTooFar && deliveryMethod !== 'paxel' && (
  <Card
    className={`border-2 shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${
      deliveryInfo?.isValid
        ? 'bg-gradient-to-br from-[#F6F2FF] to-[#F0E8FF] border-[#BFAAE3] shadow-[#BFAAE3]/20'
        : 'bg-red-50 border-red-200'
    }`}
  >
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[#5D4E8E] font-bold text-lg bg-white/50 rounded-xl p-3 border border-[#BFAAE3]/20">
          <div className="p-2 bg-[#BFAAE3] rounded-lg">
            <Motorbike className="w-5 h-5 text-white" />
          </div>
          <span className="flex-1 text-sm">Kalkulator Ongkir</span>
          {isCalculatingDelivery && (
            <div className="hidden md:flex items-center gap-2 text-sm text-[#8978B4] bg-[#BFAAE3]/10 px-3 py-1 rounded-full">
              <div className="w-4 h-4 border-2 border-[#BFAAE3]/30 border-t-[#BFAAE3] rounded-full animate-spin"></div>
              Menghitung ongkir...
            </div>
          )}
        </div>

        {isCalculatingDelivery && (
          <div className="md:hidden mt-2 w-full flex items-center justify-center gap-2 text-sm text-[#8978B4] bg-[#BFAAE3]/10 px-3 py-1 rounded-full">
            <div className="w-4 h-4 border-2 border-[#BFAAE3]/30 border-t-[#BFAAE3] rounded-full animate-spin"></div>
            Menghitung ongkir...
          </div>
        )}

        {!isCalculatingDelivery && deliveryInfo && !deliveryInfo.isValid ? (
          <div className="text-red-600 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{deliveryInfo.validationError}</span>
            </div>
          </div>
        ) : !isCalculatingDelivery && deliveryInfo ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/60 rounded-xl p-4 border border-[#BFAAE3]/20 hover:bg-white/80 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#BFAAE3]/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#BFAAE3]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#5D4E8E] text-sm">
                      Estimasi Jarak
                    </div>
                    <div className="text-[#8978B4] font-medium">
                      {deliveryInfo.zone}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 rounded-xl p-4 border border-[#BFAAE3]/20 hover:bg-white/80 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#BFAAE3]/10 rounded-lg">
                    <Timer className="w-5 h-5 text-[#BFAAE3]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#5D4E8E] text-sm">
                      Estimasi Waktu Pengiriman
                    </div>
                    <div className="text-[#8978B4] font-medium">
                      {deliveryInfo.time}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#BFAAE3] to-[#9D85D0] rounded-xl p-4 border border-[#BFAAE3] hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Motorbike className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      Perkiraan Ongkir
                    </div>
                    <div className="text-white font-bold text-lg">
                      {deliveryInfo.formattedCost}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note: ongkir masih perkiraan */}
            <p className="text-xs md:text-sm text-[#8978B4] bg-white/60 rounded-lg px-3 py-2 border border-[#BFAAE3]/20">
              Perkiraan ongkir. Ongkir final mengikuti aplikasi GoSend/GrabExpress
              (belum termasuk tol/parkir/tip).
            </p>
          </>
        ) : isCalculatingDelivery ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/40 rounded-xl p-4 border border-[#BFAAE3]/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BFAAE3]/20 rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-[#BFAAE3]/30 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-[#BFAAE3]/20 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-[#BFAAE3]/10 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/40 rounded-xl p-4 border border-[#BFAAE3]/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BFAAE3]/20 rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-[#BFAAE3]/30 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-[#BFAAE3]/20 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-[#BFAAE3]/10 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
            <div className="bg-white/40 rounded-xl p-4 border border-[#BFAAE3]/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#BFAAE3]/20 rounded-lg animate-pulse">
                  <div className="w-5 h-5 bg-[#BFAAE3]/30 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-[#BFAAE3]/20 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-[#BFAAE3]/10 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </CardContent>
  </Card>
)}

{/* Paxel Display - Show when Paxel is selected */}
{deliveryMethod === 'paxel' && (
  <Card className="border-2 shadow-lg bg-gradient-to-br from-[#F6F2FF] to-[#F0E8FF] border-[#BFAAE3] shadow-[#BFAAE3]/20">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[#5D4E8E] font-bold text-lg bg-white/50 rounded-xl p-3 border border-[#BFAAE3]/20">
          <div className="p-2 bg-[#BFAAE3] rounded-lg">
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
          <span className="flex-1 text-sm">Cek Ongkir via Paxel</span>
        </div>

        <div className="text-center">
          <p className="text-[#8978B4] mb-4">Klik tombol di bawah untuk cek ongkir pengiriman Paxel</p>
          <Button
            onClick={() => window.open('https://paxel.co/id/check-rates', '_blank')}
            className="w-full bg-[#BFAAE3] hover:bg-[#9D85D0] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Cek Ongkir Paxel
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{/* Paxel Alternative - Show when distance > 40km */}
{isDistanceTooFar && deliveryDistance && deliveryDistance > 40 && (
  <Card className="border-2 shadow-lg bg-gradient-to-br from-[#F6F2FF] to-[#F0E8FF] border-[#BFAAE3] shadow-[#BFAAE3]/20">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[#5D4E8E] font-bold text-lg bg-white/50 rounded-xl p-3 border border-[#BFAAE3]/20">
          <div className="p-2 bg-[#BFAAE3] rounded-lg">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <span className="flex-1 text-sm">Maaf layanan ini tidak tersedia untuk GoSend/GrabExpress</span>
        </div>

        <div className="text-center">
          {/* <p className="text-[#8978B4] mb-4">Untuk jarak {deliveryDistance.toFixed(1)} km, sebaiknya gunakan Paxel</p> */}
          <Button
            onClick={() => window.open('https://paxel.co/id/check-rates', '_blank')}
            className="w-full bg-[#BFAAE3] hover:bg-[#9D85D0] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Cek Ongkir Paxel
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{/* Step 4: Metode Pembayaran */}
<div
  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
    paymentMethod
      ? 'bg-green-50 border-green-200'
      : currentStep === 4
      ? 'bg-[#F6F2FF] border-[#D8CFF7]'
      : isStep4Complete
      ? 'bg-green-50 border-green-200'
      : !isStep3Complete
      ? 'bg-gray-50 border-gray-200'
      : 'bg-[#F6F2FF] border-[#D8CFF7]/40'
  }`}
>
  <div className="flex items-center gap-2 mb-3">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
        isStep4Complete
          ? 'bg-green-500 text-white'
          : currentStep === 4
          ? 'bg-[#BFAAE3] text-white'
          : !isStep3Complete
          ? 'bg-gray-300 text-gray-500'
          : 'bg-[#D8CFF7] text-[#5D4E8E]'
      }`}
    >
      4
    </div>
    <h3 className="font-semibold text-[#5D4E8E] flex items-center gap-2">
      {/* <CreditCard className="w-4 h-4" /> */}
      Metode Pembayaran
    </h3>
    {isStep4Complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
  </div>

  <FormField
    control={form.control}
    name="paymentMethod"
    render={({ field }) => (
      <FormItem className="mb-6">
        <FormLabel className="text-[#5D4E8E] flex items-center gap-2">
        <WalletCards className="w-4 h-4" />
          Pilih Metode Pembayaran
        </FormLabel>
        <Select
          value={field.value || ''}
          onValueChange={(value) => {
            field.onChange(value);
            setClearedFields((prev) => {
              const updated = new Set(prev);
              updated.delete('paymentMethod');
              return updated;
            });
          }}
          disabled={!isStep3Complete}
        >
          <FormControl>
            <SelectTrigger
              className={`rounded-xl border-[#D8CFF7]/40 bg-white ${
                !isStep3Complete ? 'bg-gray-100 cursor-not-allowed' : ''
              } ${
                clearedFields.has('paymentMethod')
                  ? 'border-amber-300 bg-amber-50'
                  : ''
              }`}
            >
              <SelectValue
                placeholder={
                  !isStep3Complete
                    ? 'Cek ongkir & pilih kurir dulu'
                    : 'Pilih metode pembayaran'
                }
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="transfer">Transfer Bank</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />

  {/* Catatan (Opsional) */}
  <FormField
    control={form.control}
    name="notes"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-[#5D4E8E] flex items-center gap-2">
        <NotebookPen className="w-4 h-4" />
          Catatan Tambahan (Opsional)
        </FormLabel>
        <FormControl>
          <Textarea
            placeholder="Ada instruksi khusus? Tulis di sini"
            {...field}
            className="rounded-xl border-[#D8CFF7]/40 focus:border-[#BFAAE3] bg-white placeholder:text-gray-400"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

{/* Ringkasan Pesanan */}
{cart.length > 0 && (
  <Card className={`border-[#D8CFF7]/40 ${
    deliveryInfo?.isValid ? 'bg-[#F6F2FF]' : 'bg-amber-50 border-amber-200'
  }`}>
    <CardContent className="p-4">
      <div className="space-y-2">
        <div className="font-semibold text-[#5D4E8E] mb-3">Ringkasan Pesanan</div>

        <div className="flex justify-between text-sm">
          <span className="text-[#8978B4]">Subtotal Produk</span>
          <span className="text-[#5D4E8E] font-medium">
            Rp {getTotalPrice().toLocaleString('id-ID')}
          </span>
        </div>

        {deliveryInfo?.isValid ? (
          <div className="flex justify-between text-sm">
            <span className="text-[#8978B4]">Perkiraan Ongkir</span>
            <span className="font-medium text-[#5D4E8E]">
              {deliveryInfo.formattedCost}
            </span>
          </div>
        ) : deliveryMethod === 'paxel' ? (
          <div className="flex justify-between text-sm">
            {/* <span className="text-[#8978B4]">Perkiraan Ongkir</span>
            <span className="font-medium text-[#5D4E8E]">
              Tidak tersedia
            </span> */}
          </div>
        ) : ""}
      </div>
    </CardContent>
  </Card>
)}

{/* Ringkasan Validasi */}
{Object.keys(errors).length > 0 && cart.length > 0 && (
  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
    <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
      <AlertCircle className="w-5 h-5" />
      <span>Ada data yang perlu dilengkapi dulu:</span>
    </div>
    <div className="space-y-2 text-sm text-red-600">
      {(() => {
        // console.log('🔴 [VALIDATION ERROR] Validation errors detected:', {
        //   errors,
        //   errorKeys: Object.keys(errors),
        //   isAddressComplete,
        //   deliveryMethod,
        //   paymentMethod,
        //   formValues: {
        //     name: form.watch('name'),
        //     phone: form.watch('phone'),
        //     address: form.watch('address'),
        //     detailedAddress: form.watch('detailedAddress'),
        //     deliveryMethod: form.watch('deliveryMethod'),
        //     paymentMethod: form.watch('paymentMethod')
        //   }
        // });
        return null;
      })()}
      {errors.name && <div>• Nama lengkap</div>}
      {errors.phone && <div>• Nomor WhatsApp</div>}
      {!isAddressComplete && <div>• Alamat lengkap (search + detail)</div>}
      {!deliveryMethod && <div>• Cek ongkir & pilih kurir</div>}
      {!paymentMethod && <div>• Metode pembayaran</div>}
    </div>
  </div>
)}

{cart.length === 0 && (
  <div className="text-xs text-red-500 flex items-center gap-2">
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    <span>Belum ada produk di keranjang. Yuk pilih menu favoritmu dulu!</span>
    <button
      onClick={scrollToProducts}
      className="ml-auto flex items-center gap-1 bg-[#BFAAE3] hover:bg-[#9D85D0] text-white px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 flex-shrink-0"
    >
      <ShoppingBag className="w-3 h-3" />
      Lihat Menu
    </button>
  </div>
)}

<Button
  type="submit"
  disabled={!isStep4Complete || cart.length === 0}
  className={`w-full transition-all duration-300 rounded-full py-6 text-lg font-semibold flex items-center justify-center gap-2 ${
    isStep4Complete && cart.length > 0
      ? 'bg-[#BFAAE3] hover:bg-[#9D85D0] text-white shadow-lg hover:shadow-xl text-md'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
>
  <MessageCircle className="w-5 h-5" />
  {isStep4Complete && cart.length > 0
    ? 'Yuk checkout via WhatsApp 🚀'
    : `Lanjut ke Langkah ${nextStep}`}
</Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  </div>

{/* Thank You Modal - Updated with Manual WhatsApp Button */}
<Dialog open={showThankYouModal} onOpenChange={() => {}}>
  <DialogContent className="sm:max-w-lg bg-white border-2 border-[#D8CFF7]/40 rounded-3xl shadow-2xl p-0 overflow-hidden">
    <div className="bg-[#F6F2FF] border-b-2 border-[#D8CFF7]/40 px-6 py-6 text-center">
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 bg-[#BFAAE3] rounded-full flex items-center justify-center shadow-lg">
          <PackageCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      <DialogTitle className="text-xl font-bold text-[#5D4E8E] mb-2">
        Terima kasih, {toCamelCase(customerName)}!
      </DialogTitle>

      <DialogDescription className="text-[#8978B4] text-sm">
        Data pesanan kamu sudah kami terima.
      </DialogDescription>
    </div>

    <div className="px-6 py-6">
      <div className="text-center mb-6">
        <p className="text-[#5D4E8E] text-sm leading-relaxed mb-4">
          Tim Tiny Bitty akan menghubungi kamu melalui WhatsApp untuk konfirmasi pesanan,
          alamat, dan detail pengiriman agar semuanya jelas dan rapi.
        </p>

        {/* Manual WhatsApp Button */}
        <div className="bg-[#F6F2FF] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* <MessagesSquare className="w-5 h-5 text-[#5D4E8E]" /> */}
            <p className="text-[#5D4E8E] font-semibold text-base">
              Lanjut konfirmasi via WhatsApp
            </p>
          </div>

          <Button
            onClick={handleWhatsAppRedirect}
            className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-2"
          >
            <MessagesSquare className="w-5 h-5" />
            Buka WhatsApp
          </Button>

          <p className="text-[#8978B4] text-xs">
            Klik tombol di atas untuk membuka WhatsApp dan mengirim pesan pesanan ke Tiny Bitty.
          </p>
        </div>

        <p className="text-[#8978B4] text-xs">
          Terima kasih sudah memilih Tiny Bitty.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-[340px] h-[200px] bg-[#F6F2FF] rounded-3xl flex items-center max-auto">
          <Lottie
            animationData={remixAnimation}
            loop={true}
            // className="w-[340px] h-[200px]"
          />
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>


{/* Order Confirmation Modal */}
<Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
  <DialogContent
    className="
      sm:max-w-2xl
      bg-white
      border-2 border-[#D8CFF7]/40
      rounded-3xl
      shadow-2xl
      p-0
      overflow-hidden
      max-h-[80vh]
      flex flex-col
    "
  >
    <div className="bg-[#F6F2FF] border-b-2 border-[#D8CFF7]/40 px-6 py-6 flex-shrink-0">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-[#5D4E8E] flex items-center gap-2">
          <ClipboardCheck className="w-8 h-8 text-[#BFAAE3]" />
          Cek Ulang Pesanan Kamu
        </DialogTitle>
        <DialogDescription className="text-[#8978B4]">
          Tolong cek lagi detail pesanan di bawah ini sebelum dikirim via WhatsApp 😊
        </DialogDescription>
      </DialogHeader>
    </div>

    <div className="px-6 py-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#F6F2FF] [&::-webkit-scrollbar-thumb]:bg-[#D8CFF7] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#BFAAE3]">
      {orderData && (
        <div className="space-y-4">
          {/* Customer Details */}
          <div className="bg-[#F6F2FF] rounded-2xl p-4">
            <h3 className="font-semibold text-[#5D4E8E] mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#BFAAE3]" />
              Data Pemesan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#8978B4]">Nama:</span>
                <div className="font-medium text-[#5D4E8E]">{toCamelCase(orderData.name)}</div>
              </div>
              <div>
                <span className="text-[#8978B4]">Nomor WhatsApp:</span>
                <div className="font-medium text-[#5D4E8E]">{orderData.phone}</div>
              </div>
              <div className="md:col-span-2">
                <span className="text-[#8978B4]">Alamat Lengkap:</span>
                <div className="font-medium text-[#5D4E8E]">{generateFullAddress()}</div>
              </div>
              <div>
                <span className="text-[#8978B4]">Kurir / Ongkir:</span>
                <div className="font-medium text-[#5D4E8E]">
                  {/* Force Paxel display when distance > 40km and GoSend/Grab unavailable */}
                  {isDistanceTooFar && deliveryDistance && deliveryDistance > 40 ? 'Paxel' : (
                    <>
                      {deliveryMethod === 'gosend' && 'GoSend Instant'}
                      {deliveryMethod === 'gosendsameday' && 'GoSend Same Day'}
                      {deliveryMethod === 'grab' && 'GrabExpress Instant'}
                      {deliveryMethod === 'grabsameday' && 'GrabExpress Same Day'}
                      {deliveryMethod === 'paxel' && 'Paxel'}
                      {!deliveryMethod && 'Belum dipilih'}
                    </>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[#8978B4]">Metode Pembayaran:</span>
                <div className="font-medium text-[#5D4E8E]">Transfer Bank</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl border-2 border-[#D8CFF7]/40 p-4">
            <h3 className="font-semibold text-[#5D4E8E] mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#BFAAE3]" />
              Produk Dipesan ({cart.length} item)
            </h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variant.size}`}
                  className="flex items-center gap-3 p-3 bg-[#F6F2FF] rounded-xl"
                >
                  <div
                    className="w-12 h-12 bg-cover bg-center bg-no-repeat rounded-xl flex-shrink-0"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#5D4E8E] text-sm truncate">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-[#8978B4]">{item.variant.size}</p>
                    <p className="text-xs text-[#BFAAE3] font-medium">
                      {item.quantity}x Rp {item.variant.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#5D4E8E]">
                      Rp {(item.variant.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className={`rounded-2xl p-4 ${
            deliveryInfo?.isValid ? 'bg-[#F6F2FF]' : 'bg-amber-50 border-2 border-amber-200'
          }`}>
            <h3 className="font-semibold text-[#5D4E8E] mb-3 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-[#BFAAE3]" />
              Ringkasan Pembayaran</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8978B4]">Subtotal Produk</span>
                <span className="text-[#5D4E8E]">
                  Rp {getTotalPrice().toLocaleString('id-ID')}
                </span>
              </div>
              {deliveryInfo?.isValid ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8978B4]">Perkiraan Ongkir</span>
                    <span className="text-[#5D4E8E]">
                      Rp {deliveryInfo.cost.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="border-t border-[#D8CFF7]/40 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-[#5D4E8E]">Total Pembayaran</span>
                      <span className="text-[#BFAAE3]">
                        Rp {(getTotalPrice() + deliveryInfo.cost).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </>
              ) : deliveryMethod === 'paxel' ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8978B4]">Perkiraan Ongkir</span>
                    <span className="text-[#5D4E8E]">
                      Konfirmasi via WhatsApp
                    </span>
                  </div>
                </>
              ) : ""}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleEditOrder}
              variant="outline"
              className="flex-1 border-2 border-[#D8CFF7]/40 text-[#5D4E8E] hover:bg-[#F6F2FF] py-3 rounded-xl font-medium"
            >
              Edit Pesanan
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="flex-1 bg-[#BFAAE3] hover:bg-[#9D85D0] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <CircleCheckBig className="w-5 h-5" />
              Konfirmasi
            </Button>
          </div>

          {orderData.notes && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
              <h4 className="font-medium text-[#5D4E8E] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Catatan Tambahan
              </h4>
              <p className="text-sm text-[#8978B4]">{orderData.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>

    </section>
  );
}
