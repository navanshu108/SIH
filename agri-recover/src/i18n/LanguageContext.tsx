import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en } from './translations/en';
import { hi } from './translations/hi';

type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('kisansetu_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('kisansetu_lang', newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = lang === 'hi' ? hi : en;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Graceful fallback
      }
    }
    return typeof value === 'string' ? value : key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook with ANTI-CRASH FALLBACK
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    console.error("LanguageProvider is missing! Please wrap your main App component.");
    // This prevents the white screen crash if the Provider is missing
    return {
      lang: 'en' as Language,
      setLang: () => {},
      t: (key: string) => {
        // Just return the last part of the key as a temporary placeholder so the UI renders
        return key.split('.').pop() || key; 
      }
    };
  }
  
  return context;
};