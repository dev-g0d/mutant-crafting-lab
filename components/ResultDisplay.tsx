import React from 'react';
import { CraftingResult, Element } from '../types';
import { SparklesIcon, DownloadIcon, HeartIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultDisplayProps {
  result: CraftingResult | null;
  isLoading: boolean;
  combinedElements: Element[];
}

const Placeholder = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-700 rounded-2xl bg-gray-900/50 p-8 text-center">
            <SparklesIcon className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-400">{t('synthesisChamberOutputTitle')}</h3>
            <p className="text-gray-500 mt-2">{t('synthesisChamberOutputSubtitle')}</p>
        </div>
    );
};

const LoadingState = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-cyan-500/50 rounded-2xl bg-gray-900/50 p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
            <p className="text-cyan-400 mt-4 text-lg font-semibold tracking-wider animate-pulse">{t('generatingSpecimen')}</p>
        </div>
    );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, combinedElements }) => {
  const { t } = useLanguage();

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${result.image}`;
    link.download = `${result.name.replace(/\s+/g, '_')}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!result) {
    return <Placeholder />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden animate-fade-in">
        <div className="relative w-full aspect-square bg-black flex items-center justify-center">
            <img 
                src={`data:image/jpeg;base64,${result.image}`} 
                alt={result.name} 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute top-2 right-2">
                <button
                    onClick={handleDownload}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-cyan-500 hover:text-white transition-colors"
                    aria-label={t('downloadImage')}
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                    {result.name}
                </h2>
                {combinedElements.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 items-center">
                        <p className="text-xs font-bold text-gray-400">{t('combinedElements')}:</p>
                        {combinedElements.map(el => (
                            <span key={el.id} className="text-xs bg-black/50 text-cyan-300 px-2 py-0.5 rounded-full">
                                {el.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="p-6 bg-gray-900 flex-grow overflow-y-auto">
            <h3 className="text-xl font-bold text-cyan-400">{t('specimenAnalysisTitle')}</h3>
            <p className="mt-2 text-gray-300 italic">{result.description}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold text-lg text-green-400">{t('analysisAbilities')}</h4>
                    <ul className="mt-2 list-disc list-inside text-gray-300 space-y-1">
                        {result.abilities.map((ability, i) => <li key={i}>{ability}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg text-red-400">{t('analysisWeaknesses')}</h4>
                    <ul className="mt-2 list-disc list-inside text-gray-300 space-y-1">
                        {result.weaknesses.map((weakness, i) => <li key={i}>{weakness}</li>)}
                    </ul>
                </div>
            </div>
             <div className="mt-6">
                <h4 className="font-bold text-lg text-yellow-400">{t('analysisHabitat')}</h4>
                <p className="mt-2 text-gray-300">{result.habitat}</p>
            </div>

            {/* Combat Profile Section */}
            <div className="mt-6 border-t-2 border-gray-800 pt-6">
                <h3 className="text-xl font-bold text-cyan-400">{t('combatProfileTitle')}</h3>
                
                <div className="mt-4">
                    <h4 className="font-bold text-lg text-red-500">{t('analysisDangerLevel')}</h4>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div 
                                className="bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 rounded-full h-4" 
                                style={{ width: `${result.dangerLevel}%` }}
                            ></div>
                        </div>
                        <span className="text-xl font-black text-red-400">{result.dangerLevel}%</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <h4 className="font-bold text-lg text-pink-400">{t('analysisSimulatedHP')}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <HeartIcon className="w-6 h-6 text-pink-500" />
                            <p className="text-2xl font-bold text-gray-200">{result.simulatedHP.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className='sm:col-span-2'>
                        <h4 className="font-bold text-lg text-orange-400">{t('analysisAttackPattern')}</h4>
                        <p className="mt-1 text-gray-300">{result.attackPattern}</p>
                    </div>
                </div>
                
                <div className="mt-4">
                    <h4 className="font-bold text-lg text-indigo-400">{t('analysisOnHitEffect')}</h4>
                    <p className="mt-1 text-gray-300">{result.onHitEffect}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ResultDisplay;