import React, { useEffect } from 'react';
import { ActiveView } from '../../types';

interface ScrollToTopProps {
  activeView?: ActiveView | string;
  smooth?: boolean;
}

/**
 * Dedicated Scroll Restoration & Instant Top Focus Component
 * Automatically resets viewport scroll to (0,0) on any activeView / route / tab transition
 * and provides global window event listening for manual scroll requests.
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({ activeView, smooth = false }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'instant'
        });
        
        // Also ensure body & document element scrollTop are 0
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.scrollTop = 0;
        }
      }
    } catch {
      window.scrollTo(0, 0);
    }
  }, [activeView, smooth]);

  useEffect(() => {
    const handleScrollToTopEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ smooth?: boolean }>;
      const isSmooth = customEvent?.detail?.smooth ?? false;
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: isSmooth ? 'smooth' : 'instant'
        });
      } catch {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('tradeheaven_scroll_top', handleScrollToTopEvent);
    return () => {
      window.removeEventListener('tradeheaven_scroll_top', handleScrollToTopEvent);
    };
  }, []);

  return null;
};

/**
 * Helper function to trigger smooth or instant scroll to top anywhere in the app
 */
export function triggerScrollToTop(smooth = false) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tradeheaven_scroll_top', { detail: { smooth } }));
  }
}
