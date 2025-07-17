import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../lib/translations';

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLanguage();

  const languages: { key: Language; label: string }[] = [
    { key: 'th', label: 'ไทย' },
    { key: 'en', label: 'EN' },
  ];

  const baseClasses = "px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200";
  const activeClasses = "bg-cyan-500 text-white";
  const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg">
      {languages.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setLang(key)}
          className={`${baseClasses} ${lang === key ? activeClasses : inactiveClasses}`}
          aria-pressed={lang === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
