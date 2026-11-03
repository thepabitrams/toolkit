// src/tools/finance/split/hooks/useUserCurrency.ts
import { useState, useEffect } from 'react';
import { COUNTRY_TO_CURRENCY, DEFAULT_CURRENCY } from '../data/currencyData';

export function useUserCurrency() {
  const [detectedCurrency, setDetectedCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const language = navigator.language;
        const countryCode = language.split('-')[1]?.toUpperCase();
        
        if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
          setDetectedCurrency(COUNTRY_TO_CURRENCY[countryCode]);
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            const data = await response.json() as { country_code?: string };
            if (data?.country_code && COUNTRY_TO_CURRENCY[data.country_code.toUpperCase()]) {
              setDetectedCurrency(COUNTRY_TO_CURRENCY[data.country_code.toUpperCase()]);
              setIsLoading(false);
              return;
            }
          }
        } catch { /* Fallback */ }

        setDetectedCurrency(DEFAULT_CURRENCY);
      } catch {
        setDetectedCurrency(DEFAULT_CURRENCY);
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  return { detectedCurrency, isLoading };
}