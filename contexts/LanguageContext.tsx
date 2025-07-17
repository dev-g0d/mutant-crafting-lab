import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { translations, Language, UIKey, ElementKey } from '../lib/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: UIKey) => string;
  getElementTranslation: (key: ElementKey | string) => { name: string; description: string } | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('th');

  const t = useCallback((key: UIKey): string => {
    return translations[lang].ui[key] || translations.en.ui[key];
  }, [lang]);
  
  const getElementTranslation = useCallback((key: ElementKey | string): { name: string; description: string } | null => {
    const element = translations[lang].elements[key as ElementKey];
    if (element) {
        return element;
    }
    // Fallback to English if not found in current language
    return translations.en.elements[key as ElementKey] || null;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    getElementTranslation,
  }), [lang, t, getElementTranslation]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
