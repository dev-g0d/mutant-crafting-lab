import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Gender } from '../types';
import { translations } from '../lib/translations';

interface GenderSelectorProps {
    selectedGender: Gender;
    onChange: (gender: Gender) => void;
    disabled: boolean;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ selectedGender, onChange, disabled }) => {
    const { t, lang } = useLanguage();
    const genders: Gender[] = ['female', 'male'];

    return (
        <div className="bg-black/30 p-3 rounded-xl">
             <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('genderTitle')}</h3>
             <div className="grid grid-cols-2 gap-2">
                {genders.map(gender => {
                    const isActive = selectedGender === gender;
                    const baseClasses = "w-full text-center px-2 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
                    const activeClasses = "bg-pink-500 text-white shadow-md";
                    const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed";
                    
                    return (
                        <button
                            key={gender}
                            onClick={() => onChange(gender)}
                            disabled={disabled}
                            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            {lang === 'th' ? translations.th.genders[gender] : translations.en.genders[gender]}
                        </button>
                    );
                })}
             </div>
        </div>
    );
};

export default GenderSelector;
