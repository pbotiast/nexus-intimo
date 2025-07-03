import React, { useState } from 'react';
import { UsersIcon } from '../components/Icons';
import type { CoupleChallenge, IcebreakerQuestion } from '../types';
import Loader from '../components/Loader';
import FeedbackWidget from '../components/FeedbackWidget';
import { useAiPreferences } from '../hooks/useAiPreferences';
import { useCouple } from '../contexts/CoupleContext';

const CouplesIntimacy: React.FC = () => {
  const { api } = useCouple();
  const [challenges, setChallenges] = useState<CoupleChallenge[]>([]);
  const [icebreaker, setIcebreaker] = useState<IcebreakerQuestion | null>(null);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [isLoadingIcebreaker, setIsLoadingIcebreaker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { recordFeedback } = useAiPreferences();

  const handleGenerateChallenges = async () => {
    setIsLoadingChallenges(true);
    setError(null);
    setChallenges([]);
    try {
      const result = await api.generateCouplesChallenges();
      setChallenges(result || []);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const handleGenerateIcebreaker = async () => {
    setIsLoadingIcebreaker(true);
    setError(null);
    setIcebreaker(null);
    try {
      const result = await api.generateIcebreakerQuestion();
      setIcebreaker(result);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoadingIcebreaker(false);
    }
  };

  const levelColor = {
    'Suave': 'border-green-400/50',
    'Picante': 'border-orange-400/50',
    'Atrevido': 'border-red-500/50',
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="text-center mb-10">
        <UsersIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Renacer Íntimo en Pareja</h2>
        <p className="mt-2 text-lg text-brand-muted">Herramientas para reavivar la chispa, profundizar la conexión y explorar juntos.</p>
      </header>

      {error && <div className="my-4 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">{error}</div>}

      {/* Retos Sexuales */}
      <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10 mb-12">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light mb-4 text-center">Retos de Intensidad Gradual</h3>
        <p className="text-brand-muted mb-6 text-center">Generad una nueva serie de retos para vuestra próxima aventura íntima.</p>
        <div className="text-center">
          <button onClick={handleGenerateChallenges} disabled={isLoadingChallenges} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500">
            {isLoadingChallenges ? 'Generando Retos...' : 'Nuevos Retos para Dos'}
          </button>
        </div>
        
        {isLoadingChallenges && <Loader text="Buscando nuevas chispas..."/>}
        
        {challenges.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {challenges.map(challenge => (
              <div key={challenge.title} className={`bg-brand-deep-purple p-6 rounded-lg border-l-4 ${levelColor[challenge.level]} flex flex-col`}>
                <span className={`text-sm font-bold ${levelColor[challenge.level].replace('border-', 'text-').replace('/50', '')}`}>{challenge.level}</span>
                <h4 className="text-lg sm:text-xl font-serif text-brand-light mt-1 mb-2 flex-grow">{challenge.title}</h4>
                <p className="text-brand-muted text-sm flex-grow">{challenge.description}</p>
                 <FeedbackWidget 
                    onFeedback={(feedback) => recordFeedback('challenge_level', challenge.level, feedback)}
                    contentId={`${challenge.title}-${challenge.level}`}
                    size="sm"
                 />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* El Puente de la Comunicación */}
      <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light mb-4 text-center">El Puente de la Comunicación</h3>
        <p className="text-brand-muted mb-6 text-center">Una pregunta puede abrir un universo. Generad una pregunta para conectar a un nivel más profundo.</p>
        <div className="text-center">
          <button onClick={handleGenerateIcebreaker} disabled={isLoadingIcebreaker} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500">
            {isLoadingIcebreaker ? 'Pensando...' : 'Generar Pregunta Rompehielos'}
          </button>
        </div>

        {isLoadingIcebreaker && <Loader text="Buscando la pregunta perfecta..."/>}
        
        {icebreaker && (
          <div className="mt-8 text-center bg-brand-deep-purple p-6 rounded-lg animate-fade-in border border-brand-accent/50">
              <p className="text-xs text-brand-muted uppercase tracking-wider">{icebreaker.category}</p>
              <p className="text-xl sm:text-2xl font-serif text-brand-light mt-2">{icebreaker.question}</p>
              <FeedbackWidget onFeedback={(feedback) => recordFeedback('challenge_type', icebreaker.category, feedback)} contentId={icebreaker.question} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CouplesIntimacy;
