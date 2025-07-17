import React from 'react';
import { Element } from '../types';
import { FlaskIcon, TrashIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CombinerProps {
  selectedElements: Element[];
  onCombine: () => void;
  onClear: () => void;
  isLoading: boolean;
}

const Combiner: React.FC<CombinerProps> = ({ selectedElements, onCombine, onClear, isLoading }) => {
  const { t } = useLanguage();
  const canCombine = selectedElements.length >= 2 && !isLoading;

  return (
    <div className="bg-gray-900/70 border-2 border-gray-800 p-6 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FlaskIcon className="w-6 h-6 text-cyan-400"/>
                {t('combinerTitle')}
                <span className="text-lg font-normal text-gray-400 ml-2">({selectedElements.length} / 8)</span>
            </h2>
            <button
                onClick={onClear}
                disabled={selectedElements.length === 0 || isLoading}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors disabled:text-gray-700 disabled:cursor-not-allowed"
                aria-label={t('clearSelection')}
            >
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
      
      <div className="min-h-[8rem] bg-black/30 border border-dashed border-gray-700 rounded-lg p-3 flex flex-wrap gap-3 items-center justify-center">
        {selectedElements.length === 0 ? (
          <p className="text-gray-500">{t('selectElementsPrompt')}</p>
        ) : (
          selectedElements.map(el => (
            <div key={el.id} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold border border-gray-600 animate-fade-in">
              {el.name}
            </div>
          ))
        )}
      </div>

      <button
        onClick={onCombine}
        disabled={!canCombine}
        className="mt-6 w-full py-4 text-xl font-bold rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-3
                   bg-cyan-600 text-white
                   hover:bg-cyan-500
                   disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-4 focus:ring-cyan-400/50
                   transform hover:scale-105 disabled:transform-none"
      >
        {isLoading ? (
            <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t('synthesizingButton')}
            </>
        ) : (
            <>
                <FlaskIcon className="w-6 h-6" />
                {t('synthesizeButton')}
            </>
        )}
      </button>
    </div>
  );
};

export default Combiner;