// Facebook Pixel tracking implementation with TypeScript support

declare global {
  interface Window {
    fbq: {
      (action: string, event: string, data?: Record<string, any>): void;
    };
  }
}

export interface FacebookPixelData {
  content_ids: string[];
  content_name?: string;
  content_type?: string;
  currency?: string;
  value?: number;
  content_variant?: string;
  content_category?: string;
  [key: string]: any;
}

export interface FBPixelTrackFunction {
  (event: string, data?: Partial<FacebookPixelData>): Promise<void> | void;
}

/**
 * Tracks Facebook Pixel events
 * @param event - The event name to track
 * @param data - Optional event data
 */
export const fbPixelTrack: FBPixelTrackFunction = (event, data = {}) => {
  console.log(`🚀 [FB PIXEL TRACKER] Event: ${event}`, data);
  
  if (typeof window !== "undefined" && window.fbq) {
    try {
      window.fbq("track", event, data);
      console.log(`✅ [FB PIXEL TRACKER] Successfully sent ${event} event`);
    } catch (error) {
      console.error(`❌ [FB PIXEL TRACKER] Error sending ${event} event:`, error);
    }
  } else {
    console.warn("⚠️ [FB PIXEL TRACKER] Facebook Pixel (fbq) not loaded yet - Event:", event, data);
  }
};