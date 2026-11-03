// src/tools/finance/split/hooks/useUserCurrency.ts
import { useState, useEffect } from 'react';
import { COUNTRY_TO_CURRENCY, DEFAULT_CURRENCY } from '../data/currencyData';

export function useUserCurrency() {
  const [detectedCurrency, setDetectedCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const browserLanguage = navigator.language;
        const isoCountryCode = browserLanguage.split('-')[1]?.toUpperCase();
        
        if (isoCountryCode && COUNTRY_TO_CURRENCY[isoCountryCode]) {
          setDetectedCurrency(COUNTRY_TO_CURRENCY[isoCountryCode]);
          setIsLoading(false);
          return;
        }

        try {
          const networkResponse = await fetch('https://ipapi.co/json/');
          if (networkResponse.ok) {
            const ipLocationData = await networkResponse.json() as { country_code?: string };
            if (ipLocationData?.country_code && COUNTRY_TO_CURRENCY[ipLocationData.country_code.toUpperCase()]) {
              setDetectedCurrency(COUNTRY_TO_CURRENCY[ipLocationData.country_code.toUpperCase()]);
              setIsLoading(false);
              return;
            }
          }
        } catch (networkError) {
          console.warn('Network currency detection failed:', networkError);
        }

        setDetectedCurrency(DEFAULT_CURRENCY);
      } catch (detectionError) {
        console.error('Currency detection failed:', detectionError);
        setDetectedCurrency(DEFAULT_CURRENCY);
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  return { detectedCurrency, isLoading };
}