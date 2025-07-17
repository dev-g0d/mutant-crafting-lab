import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Element } from '../types';
import { DnaIcon } from './icons';

interface ElementInfoModalProps {
  element: Element;
  onClose: () => void;
}

const ElementInfoModal: React.FC<ElementInfoModalProps> = ({ element, onClose }) => {
  const { t } = useLanguage();

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-8 w-full max-w-md m-4 shadow-2xl shadow-black/50 transform animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
            <DnaIcon className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white">{element.name}</h2>
        </div>
        
        <p className="text-gray-300 mb-6">{element.description}</p>
        
        <div className="flex justify-end">
            <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-md font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition"
            >
                {t('closeButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ElementInfoModal;