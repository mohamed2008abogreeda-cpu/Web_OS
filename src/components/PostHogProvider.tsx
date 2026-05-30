'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

// Client-side initialization of PostHog with secure options
if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_dummy_key_for_dev_mode',
    {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // Disabling automatic pageview to capture manually via searchParams
      session_recording: {
        opt_in: true // Explicitly enable Session Replay recording
      } as any
    }
  );
}

// ── Next.js 15+ Suspense-bound Pageview Tracker ──────────────────
function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      
      // Manually capture high-fidelity pageview events with target URLs
      posthog.capture('$pageview', {
        $current_url: url
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Session Identification side effect executing strictly client-side to prevent hydration mismatches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('webos_posthog_session_id') || '';
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15) + '-' + Date.now();
        localStorage.setItem('webos_posthog_session_id', sessionId);
      }
      
      // Correlate telemetry security events and session recording using identified profiling
      posthog.identify(sessionId, {
        environment: 'Linux_Brutalist',
        viewport: window.innerWidth,
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
