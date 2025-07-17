import React from 'react';
import { Element } from '../types';
import { DnaIcon, InfoIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ElementCardProps {
  element: Element;
  onSelect: (element: Element) => void;
  onInfoClick: (element: Element) => void;
  isSelected: boolean;
  isNew?: boolean;
}

const ElementCard: React.FC<ElementCardProps> = ({ element, onSelect, onInfoClick, isSelected, isNew }) => {
  const { t } = useLanguage();
  const baseClasses = "relative group flex flex-col items-center justify-center text-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1";
  const borderClasses = isSelected 
    ? "border-cyan-400 bg-cyan-900/50 scale-105" 
    : "border-gray-700 hover:border-cyan-500 bg-gray-900 hover:bg-gray-800";
  
  const newClasses = isNew ? "border-green-400 animate-pulse" : "";

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from being selected when clicking the info button
    onInfoClick(element);
  };

  return (
    <div className={`${baseClasses} ${borderClasses} ${newClasses}`} onClick={() => onSelect(element)}>
      <button 
        onClick={handleInfoClick} 
        className="absolute top-1 right-1 p-1 text-gray-500 hover:text-cyan-300 transition-colors z-10"
        aria-label={`Info for ${element.name}`}
      >
        <InfoIcon className="w-4 h-4" />
      </button>
      {isNew && <span className="absolute -top-2 -left-2 px-2 py-1 text-xs font-bold text-black bg-green-400 rounded-full z-10">{t('newLabel')}</span>}
      <DnaIcon className="w-8 h-8 mb-2 text-cyan-400 group-hover:text-green-300 transition-colors" />
      <h3 className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">{element.name}</h3>
    </div>
  );
};

export default ElementCard;