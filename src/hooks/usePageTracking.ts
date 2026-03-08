import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

export function usePageTracking(pagePath?: string) {
  useEffect(() => {
    const path = pagePath || window.location.pathname;
    
    // Don't track admin pages
    if (path.startsWith('/admin')) return;

    const trackView = async () => {
      try {
        await supabase.from('page_views').insert({
          page_path: path,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowser(),
          session_id: getSessionId(),
        });
      } catch (error) {
        // Silently fail - analytics should never break the app
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackView();
  }, [pagePath]);
}
