import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GameState, Element, CraftingResult, ExperimentType, Gender } from './types';
import { INITIAL_ELEMENT_IDS } from './constants';
import { craftNewMutant } from './services/geminiService';
import ElementCard from './components/ElementCard';
import Combiner from './components/Combiner';
import ResultDisplay from './components/ResultDisplay';
import { DnaIcon, RotateCcwIcon, PlusCircleIcon, SearchIcon } from './components/icons';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import { translations, ElementKey } from './lib/translations';
import CreateElementModal from './components/CreateElementModal';
import ElementInfoModal from './components/ElementInfoModal';
import ExperimentTypeSelector from './components/ExperimentTypeSelector';
import GenderSelector from './components/GenderSelector';


type ErrorState = {
  type: 'synthesis' | 'create';
  message: string;
} | null;

const SAVE_KEY = 'mutantLabSaveData';

const createInitialGameState = (): GameState => {
    const initialLang = 'th';
    const elements: Record<string, Element> = {};
    INITIAL_ELEMENT_IDS.forEach(id => {
        const translation = translations[initialLang].elements[id as ElementKey] || translations.en.elements[id as ElementKey];
        if (translation) {
            elements[id] = { id, ...translation };
        } else {
            elements[id] = { id, name: id.replace(/-/g, ' '), description: '...' };
        }
    });
    return {
        elements,
        discoveryOrder: [...INITIAL_ELEMENT_IDS],
    };
};


const App: React.FC = () => {
  const { lang, t, getElementTranslation } = useLanguage();

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.elements && parsed.discoveryOrder) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to load saved data:", error);
        localStorage.removeItem(SAVE_KEY);
    }
    return createInitialGameState();
  });
  
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);
  const [latestResult, setLatestResult] = useState<CraftingResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>(null);
  const [newElementIds, setNewElementIds] = useState<string[]>([]);
  const [viewedElement, setViewedElement] = useState<Element | null>(null);
  const [experimentType, setExperimentType] = useState<ExperimentType>('mutant');
  const [gender, setGender] = useState<Gender>('female');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (error) {
        console.error("Failed to save game state:", error);
    }
  }, [gameState]);

  useEffect(() => {
    setGameState(prevGameState => {
        const newElements = { ...prevGameState.elements };
        let hasChanged = false;
        Object.keys(newElements).forEach(id => {
            const translation = getElementTranslation(id);
            if (translation && newElements[id].name !== translation.name) {
                newElements[id] = { ...newElements[id], ...translation };
                hasChanged = true;
            }
        });
        return hasChanged ? { ...prevGameState, elements: newElements } : prevGameState;
    });
  }, [lang, getElementTranslation]);


  const filteredElements: Element[] = useMemo(() => {
    const allElements = gameState.discoveryOrder.map(id => gameState.elements[id]).filter(Boolean);
    const sortedElements = allElements.sort((a,b) => a.name.localeCompare(b.name, lang));

    if (!searchTerm) {
        return sortedElements;
    }

    return sortedElements.filter(el => 
        el.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gameState, lang, searchTerm]);

  const handleSelectElement = useCallback((element: Element) => {
    if (isLoading || isCreating) return;
    setError(null);
    setNewElementIds(ids => ids.filter(id => id !== element.id));
    setSelectedElements(prev => {
      if (prev.find(e => e.id === element.id)) {
        return prev.filter(e => e.id !== element.id);
      }
      if (prev.length < 8) {
        return [...prev, element];
      }
      return prev;
    });
  }, [isLoading, isCreating]);

  const handleClearSelection = useCallback(() => {
    setSelectedElements([]);
  }, []);
  
  const handleResetProgress = useCallback(() => {
    if (window.confirm(t('resetProgressConfirmation'))) {
        localStorage.removeItem(SAVE_KEY);
        setGameState(createInitialGameState());
        setSelectedElements([]);
        setLatestResult(null);
        setError(null);
        setNewElementIds([]);
    }
  }, [t]);
  
  const handleCreateElement = useCallback((name: string, description: string) => {
    setError(null);
    
    if (Object.values(gameState.elements).some(el => el.name.trim().toLowerCase() === name.trim().toLowerCase())) {
        setError({ type: 'create', message: t('duplicateError') });
        return;
    }

    // FIX: Use a robust, unique ID generation method that doesn't rely on the element name.
    const newId = 'user-' + Date.now();
    const newElement: Element = { id: newId, name, description };
    
    setGameState(prev => ({
        ...prev,
        elements: { ...prev.elements, [newId]: newElement },
        discoveryOrder: [...prev.discoveryOrder, newId]
    }));
    
    setNewElementIds([newId]);
    setIsCreating(false);
  }, [gameState, t]);

  const handleCombine = useCallback(async () => {
    if (selectedElements.length < 2) return;

    setIsLoading(true);
    setError(null);
    setNewElementIds([]);

    const selectedNames = selectedElements.map(e => e.name);

    try {
      const result = await craftNewMutant(selectedNames, experimentType, gender, lang);

      setLatestResult(result);
      
      // Use a robust method to generate an ID from the result name for checking existence
      const resultIdCheck = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      if (!gameState.elements[resultIdCheck] && !Object.values(gameState.elements).some(el => el.name.toLowerCase() === result.name.toLowerCase())) {
        const newElement: Element = { id: resultIdCheck, name: result.name, description: result.description };
        setGameState(prev => ({
            ...prev,
            elements: { ...prev.elements, [resultIdCheck]: newElement },
            discoveryOrder: [...prev.discoveryOrder, resultIdCheck]
        }));
        setNewElementIds([resultIdCheck]);
      } else {
         const existingElement = Object.values(gameState.elements).find(el => el.name.toLowerCase() === result.name.toLowerCase());
         if(existingElement) {
             setNewElementIds([existingElement.id]);
         }
      }

      setSelectedElements([]);
    } catch (err) {
      setError({ type: 'synthesis', message: (err instanceof Error) ? err.message : "An unknown error occurred." });
      setLatestResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedElements, lang, gameState, experimentType, gender]);

  return (
    <>
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-4">
            <DnaIcon className="w-10 h-10 text-cyan-400" />
            {t('mutantLabTitle')}
            <DnaIcon className="w-10 h-10 text-green-400" />
          </h1>
          <p className="text-gray-400 mt-2 text-lg">{t('mutantLabSubtitle')}</p>
          <div className="absolute top-0 right-0">
            <LanguageSwitcher />
          </div>
        </header>

        {error && error.type === 'synthesis' && (
            <div className="bg-red-900/50 border-red-500 text-red-300 border px-4 py-3 rounded-lg relative mb-6 text-center animate-fade-in" role="alert">
                <strong className="font-bold mr-2">{t('synthesisFailed')}</strong>
                <span className="block sm:inline">{error.message}</span>
            </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Combiner 
                selectedElements={selectedElements}
                onCombine={handleCombine}
                onClear={handleClearSelection}
                isLoading={isLoading}
            />
            <div className="bg-gray-900/70 border-2 border-gray-800 p-6 rounded-2xl">
                <div className="space-y-4">
                   <GenderSelector
                        selectedGender={gender}
                        onChange={setGender}
                        disabled={isLoading || isCreating}
                    />
                    <ExperimentTypeSelector
                        selectedType={experimentType}
                        onChange={setExperimentType}
                        disabled={isLoading || isCreating}
                    />
                </div>
                 <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{t('elementInventoryTitle')}</h2>
                        <button
                          onClick={handleResetProgress}
                          title={t('resetProgressButton')}
                          className="text-gray-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading || isCreating}
                        >
                            <RotateCcwIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 border-2
                                   disabled:cursor-not-allowed disabled:opacity-50
                                   bg-gray-800 border-green-500 text-green-300 hover:bg-green-900/50 hover:border-green-400 hover:text-white
                                   disabled:bg-gray-800 disabled:border-gray-700 disabled:text-gray-500"
                    >
                        <PlusCircleIcon className="w-5 h-5"/>
                        {t('createElementButton')}
                    </button>
                 </div>
                 <div className="relative my-4">
                    <input 
                        type="text"
                        placeholder={t('searchElementsPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border-2 border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-500" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                    {filteredElements.map(el => (
                        <ElementCard 
                            key={el.id} 
                            element={el}
                            onSelect={handleSelectElement}
                            onInfoClick={(element) => setViewedElement(element)}
                            isSelected={!!selectedElements.find(s => s.id === el.id)}
                            isNew={newElementIds.includes(el.id)}
                        />
                    ))}
                 </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ResultDisplay result={latestResult} isLoading={isLoading} combinedElements={latestResult ? selectedElements : []} />
          </div>
        </main>
      </div>
    </div>
    {isCreating && (
        <CreateElementModal 
            onClose={() => { setIsCreating(false); setError(null); }} 
            onCreate={handleCreateElement}
            error={error && error.type === 'create' ? error.message : null}
        />
    )}
    {viewedElement && (
        <ElementInfoModal
            element={viewedElement}
            onClose={() => setViewedElement(null)}
        />
    )}
    </>
  );
};

export default App;