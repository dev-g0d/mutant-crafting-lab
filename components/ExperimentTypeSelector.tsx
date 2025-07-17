import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ExperimentType } from '../types';
import { translations } from '../lib/translations';

interface ExperimentTypeSelectorProps {
    selectedType: ExperimentType;
    onChange: (type: ExperimentType) => void;
    disabled: boolean;
}

const ExperimentTypeSelector: React.FC<ExperimentTypeSelectorProps> = ({ selectedType, onChange, disabled }) => {
    const { t, lang } = useLanguage();
    const experimentTypes = Object.keys(translations.en.experimentTypes) as ExperimentType[];

    return (
        <div className="bg-black/30 p-3 rounded-xl">
             <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('experimentTypeTitle')}</h3>
             <div className="grid grid-cols-3 gap-2">
                {experimentTypes.map(type => {
                    const isActive = selectedType === type;
                    const baseClasses = "w-full text-center px-2 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
                    const activeClasses = "bg-cyan-500 text-white shadow-md";
                    const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed";
                    
                    return (
                        <button
                            key={type}
                            onClick={() => onChange(type)}
                            disabled={disabled}
                            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            {translations[lang].experimentTypes[type]}
                        </button>
                    );
                })}
             </div>
        </div>
    );
};

export default ExperimentTypeSelector;