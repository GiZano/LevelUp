import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../utils/i18n';

interface LocaleContextType {
  locale: string;
  isReloading: boolean;
  changeLocale: (lang: string) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState(i18n.locale);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('app_language').then((lang) => {
      if (lang) {
        i18n.locale = lang;
        setLocale(lang);
      }
    });
  }, []);

  const changeLocale = async (lang: string) => {
    if (lang === locale) return;
    setIsReloading(true);
    i18n.locale = lang;
    await AsyncStorage.setItem('app_language', lang);
    
    // Simulate a brief loading to allow UI to settle and show the overlay
    setTimeout(() => {
      setLocale(lang);
      setTimeout(() => {
        setIsReloading(false);
      }, 500); // 500ms extra to hide overlay smoothly
    }, 500);
  };

  return (
    <LocaleContext.Provider value={{ locale, isReloading, changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
