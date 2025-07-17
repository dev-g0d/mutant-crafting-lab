import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusCircleIcon } from './icons';

interface CreateElementModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
  error: string | null;
}

const CreateElementModal: React.FC<CreateElementModalProps> = ({ onClose, onCreate, error }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-8 w-full max-w-md m-4 shadow-2xl shadow-black/50 transform animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
            <PlusCircleIcon className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">{t('createElementTitle')}</h2>
        </div>
        
        {error && (
            <div className="bg-red-900/50 border-red-500 text-red-300 border px-4 py-2 rounded-lg mb-4 text-sm" role="alert">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="element-name" className="block text-sm font-medium text-gray-400 mb-1">
              {t('nameLabel')}
            </label>
            <input
              type="text"
              id="element-name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={50}
              className="w-full bg-gray-800 border-2 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="e.g., Sentient Starlight"
            />
          </div>
          <div>
            <label htmlFor="element-description" className="block text-sm font-medium text-gray-400 mb-1">
              {t('descriptionLabel')}
            </label>
            <textarea
              id="element-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={150}
              className="w-full bg-gray-800 border-2 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="e.g., A conscious celestial body with immense gravity."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition"
            >
              {t('cancelButton')}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 rounded-md font-semibold text-white bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              {t('saveButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateElementModal;
