import React, { useState } from 'react';
import type { GeneratedStory, StoryParams } from '../src/types';
import Loader from '../src/components/Loader';
import FeedbackWidget from '../src/components/FeedbackWidget';
import { useAiPreferences } from '../src/hooks/useAiPreferences';
import { BookmarkSquareIcon } from '../src/components/Icons';
import { useCouple } from '../src/contexts/CoupleContext';
import { openPassportModal } from '../src/components/PassportModal';


const StoryWeaver: React.FC = () => {
  const { api } = useCouple();
  const [params, setParams] = useState<StoryParams>({
    theme: 'Encuentro romántico',
    intensity: 'Sugerente y sensual',
    length: 'Corta (200-300 palabras)',
    protagonists: 'Una pareja redescubriéndose'
  });
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { recordFeedback } = useAiPreferences();

  const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStory(null);
    try {
      const result = await api.generateEroticStory({ params });
      setStory(result);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (feedback: 'like' | 'dislike') => {
    recordFeedback('story_theme', params.theme, feedback);
    recordFeedback('story_intensity', params.intensity, feedback);
  };

  const handleSealMoment = () => {
    if (story) {
        openPassportModal({
            category: 'Fantasía Cumplida',
            title: story.title,
            notes: `Leímos juntos la historia "${story.title}" y exploramos el tema de "${params.theme}".`
        });
    }
  };

  const formControlClass = "w-full bg-brand-navy border border-brand-muted/50 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition";

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">StoryWeaver <span className="text-brand-accent">AI</span></h2>
        <p className="mt-2 text-lg text-brand-muted">Crea tus propias narrativas íntimas. Define los ingredientes y deja que la IA teja una historia para ti.</p>
      </header>

      <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="protagonists" className="block text-sm font-medium text-brand-muted mb-2">Protagonistas</label>
            <input type="text" name="protagonists" id="protagonists" value={params.protagonists} onChange={handleParamChange} className={formControlClass} />
          </div>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-brand-muted mb-2">Tema Principal</label>
            <select name="theme" id="theme" value={params.theme} onChange={handleParamChange} className={formControlClass}>
              <option>Encuentro romántico</option>
              <option>Fantasía de poder</option>
              <option>Amor prohibido</option>
              <option>Aventura de una noche</option>
              <option>Reencuentro apasionado</option>
            </select>
          </div>
          <div>
            <label htmlFor="intensity" className="block text-sm font-medium text-brand-muted mb-2">Nivel de Intensidad</label>
            <select name="intensity" id="intensity" value={params.intensity} onChange={handleParamChange} className={formControlClass}>
              <option>Sugerente y sensual</option>
              <option>Apasionado y explícito</option>
              <option>Juguetón y divertido</option>
              <option>Dominante y sumiso</option>
            </select>
          </div>
          <div>
            <label htmlFor="length" className="block text-sm font-medium text-brand-muted mb-2">Longitud de la Historia</label>
            <select name="length" id="length" value={params.length} onChange={handleParamChange} className={formControlClass}>
              <option>Corta (200-300 palabras)</option>
              <option>Media (400-600 palabras)</option>
              <option>Larga (800+ palabras)</option>
            </select>
          </div>
          <div className="md:col-span-2 text-center mt-4">
            <button type="submit" disabled={isLoading} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed w-full md:w-auto">
              {isLoading ? 'Tejiendo Historia...' : 'Generar Historia'}
            </button>
          </div>
        </form>
      </div>
      
      {isLoading && <Loader text="La musa de la IA está trabajando..."/>}

      {error && <div className="mt-8 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">{error}</div>}

      {story && (
        <article className="mt-10 bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10 animate-fade-in">
          <h3 className="font-serif text-3xl sm:text-4xl text-brand-accent text-center mb-6">{story.title}</h3>
          <div className="prose sm:prose-lg prose-invert max-w-none text-brand-light/90 space-y-4">
            {story.content.map((paragraph, index) => (
              <p key={index} className="text-justify leading-relaxed">{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 border-t border-brand-muted/20 pt-6 flex flex-col sm:flex-row justify-center items-center gap-6">
            <FeedbackWidget onFeedback={handleFeedback} contentId={story.title} />
            <button
                onClick={handleSealMoment}
                className="flex items-center justify-center gap-2 text-sm text-brand-accent font-semibold bg-brand-deep-purple hover:bg-brand-accent/20 py-2 px-4 rounded-md transition-colors"
            >
                <BookmarkSquareIcon className="w-5 h-5" />
                Añadir esta fantasía al Pasaporte
            </button>
          </div>
        </article>
      )}
    </div>
  );
};

export default StoryWeaver;
