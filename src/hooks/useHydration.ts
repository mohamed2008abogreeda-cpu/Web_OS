import { useState, useEffect } from 'react';

/**
 * Custom hook to safely detect when the client-side React application has fully hydrated.
 * Essential for preventing hydration mismatch crashes in Next.js App Router when using state persistence.
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
