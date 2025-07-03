import React, { useState, useEffect } from 'react';
import { DocumentDuplicateIcon, SparklesIcon } from '../src/components/Icons';
import Loader from '../src/components/Loader';
import FeedbackWidget from '../src/components/FeedbackWidget';
import { useAiPreferences } from '../src/hooks/useAiPreferences';
import { useCouple } from '../src/contexts/CoupleContext';

const TandemJournal: React.FC = () => {
    const { coupleData, api } = useCouple();
    const entry = coupleData?.tandemEntry;

    const [answer1Input, setAnswer1Input] = useState('');
    const [answer2Input, setAnswer2Input] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { recordFeedback } = useAiPreferences();

    useEffect(() => {
        if (!entry) {
            handleGenerateNewPrompt();
        }
    }, [entry]);

    const handleGenerateNewPrompt = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await api.generateTandemJournalPrompt();
            setAnswer1Input('');
            setAnswer2Input('');
        } catch (err: any) {
            setError(err.message || 'No se pudo generar una nueva pregunta.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveAnswer = async (partner: 'partner1' | 'partner2', answer: string) => {
        if (!entry || !answer.trim()) return;
        
        try {
            await api.saveTandemAnswer({ partner, answer: answer.trim() });
            if (partner === 'partner1') setAnswer1Input('');
            if (partner === 'partner2') setAnswer2Input('');
        } catch (e: any) {
            setError(e.message || 'No se pudo guardar la respuesta');
        }
    };

    const bothAnswered = entry?.answer1 && entry?.answer2;

    const renderPartnerCard = (
        partner: 'partner1' | 'partner2',
        title: string,
        answer: string | null,
        inputValue: string,
        setInputValue: (val: string) => void,
        otherAnswer: string | null
    ) => (
        <div className="bg-brand-navy p-6 rounded-xl shadow-lg border border-white/10 flex flex-col">
            <h3 className="text-xl font-serif text-brand-light mb-4">{title}</h3>
            {bothAnswered ? (
                <div className="bg-brand-deep-purple p-4 rounded-lg flex-grow">
                    <p className="text-brand-light/90 whitespace-pre-wrap">{answer}</p>
                </div>
            ) : answer ? (
                 <div className="bg-brand-deep-purple p-4 rounded-lg flex-grow flex items-center justify-center text-center">
                    <p className="text-brand-muted">Esperando la respuesta de tu pareja para revelar los secretos...</p>
                </div>
            ) : (
                <div className="flex flex-col flex-grow">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                        rows={5}
                        className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-accent transition flex-grow"
                        disabled={!!otherAnswer && !bothAnswered}
                    />
                    <button
                        onClick={() => handleSaveAnswer(partner, inputValue)}
                        className="mt-4 w-full bg-brand-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-600"
                        disabled={!inputValue.trim()}
                    >
                        Guardar mi respuesta
                    </button>
                </div>
            )}
        </div>
    );


    return (
        <div className="max-w-5xl mx-auto animate-fade-in text-center">
            <header className="mb-10">
                <DocumentDuplicateIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Diario Tándem</h2>
                <p className="mt-2 text-lg text-brand-muted max-w-3xl mx-auto">Responded a la misma pregunta en secreto. Las respuestas solo se revelarán cuando ambos hayáis terminado, fomentando la empatía y el descubrimiento.</p>
            </header>

            {isLoading && !entry && <Loader text="Generando una pregunta para conectaros..." />}
            {error && <div className="my-4 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">{error}</div>}

            {entry && (
                 <div className="bg-gradient-to-br from-brand-accent/10 via-brand-navy to-brand-navy p-6 rounded-xl shadow-lg border border-brand-accent/30 mb-8">
                    <h3 className="text-2xl sm:text-3xl font-serif text-brand-accent">La Pregunta del Día:</h3>
                    <p className="text-xl text-brand-light mt-2">"{entry.prompt}"</p>
                     <FeedbackWidget 
                        onFeedback={(feedback) => recordFeedback('tandem_prompt', 'prompt', feedback)}
                        contentId={entry.id}
                     />
                </div>
            )}

            {entry && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {renderPartnerCard('partner1', 'Tu Respuesta', entry.answer1, answer1Input, setAnswer1Input, entry.answer2)}
                    {renderPartnerCard('partner2', 'Respuesta de tu Pareja', entry.answer2, answer2Input, setAnswer2Input, entry.answer1)}
                </div>
            )}

            <div className="mt-10">
                <button
                    onClick={handleGenerateNewPrompt}
                    disabled={isLoading}
                    className="bg-brand-navy text-brand-light font-bold py-3 px-8 rounded-lg hover:bg-brand-deep-purple border border-brand-muted/50 transition duration-300 disabled:bg-gray-600 flex items-center gap-2 mx-auto"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? 'Generando...' : 'Generar Nueva Pregunta'}
                </button>
            </div>
        </div>
    );
};

export default TandemJournal;
