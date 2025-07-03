import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PuzzlePieceIcon, BookOpenIcon, MapPinIcon, HeartIcon, SparklesIcon, FireIcon } from '../components/Icons';
import type { RoleplayScenario, DateIdea, RealWorldAdventure, RitualStepType, AdventureStyle } from '../types';
import Loader from '../components/Loader';
import FeedbackWidget from '../components/FeedbackWidget';
import { useAiPreferences } from '../hooks/useAiPreferences';
import { useCouple } from '../contexts/CoupleContext';


const getLinkForStep = (type: RitualStepType): string => {
  switch (type) {
    case 'audio_guide': return '/audio-guides';
    case 'couple_challenge':
    case 'conversation':
      return '/couples-intimacy';
    case 'position': return '/mastery';
    case 'game_dice': return '/sex-dice';
    case 'game_board': return '/desire-path';
    case 'story': return '/story-weaver';
    default: return '/';
  }
}

const Adventures: React.FC = () => {
    const { api } = useCouple();

    // --- State for existing features ---
    const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
    const [isLoadingScenario, setIsLoadingScenario] = useState(false);
    const [scenarioTheme, setScenarioTheme] = useState('Encuentro casual en un bar de jazz');
    
    const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
    const [isLoadingDate, setIsLoadingDate] = useState(false);
    const [dateCategory, setDateCategory] = useState('Romántica');

    // --- State for NEW Real World Adventure feature ---
    const [realWorldAdventure, setRealWorldAdventure] = useState<RealWorldAdventure | null>(null);
    const [isLoadingRWA, setIsLoadingRWA] = useState(false);
    const [rwaError, setRwaError] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<AdventureStyle | null>(null);

    const [error, setError] = useState<string | null>(null);
    const { recordFeedback } = useAiPreferences();

    const handleGenerateScenario = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingScenario(true);
        setError(null);
        setScenario(null);
        try {
            const result = await api.generateRoleplayScenario({ theme: scenarioTheme });
            setScenario(result);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error desconocido.');
        } finally {
            setIsLoadingScenario(false);
        }
    };

    const handleGenerateDate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingDate(true);
        setError(null);
        setDateIdea(null);
        try {
            const result = await api.generateDateIdea({ category: dateCategory });
            setDateIdea(result);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error desconocido.');
        } finally {
            setIsLoadingDate(false);
        }
    };

    const generateAdventureApiCall = async (style: AdventureStyle, coords?: { latitude: number; longitude: number }) => {
        try {
            const result = await api.generateRealWorldAdventure({ coords, style });
            setRealWorldAdventure(result);
        } catch (err: any) {
            setRwaError(err.message || "No se pudo generar la aventura.");
        } finally {
            setIsLoadingRWA(false);
            setSelectedStyle(null);
        }
    };

    const handleGenerateRealWorldAdventure = (style: AdventureStyle) => {
        setIsLoadingRWA(true);
        setRwaError(null);
        setRealWorldAdventure(null);
        setSelectedStyle(style);

        if (!navigator.geolocation) {
            setRwaError("La geolocalización no está soportada. Generando una aventura genérica.");
            generateAdventureApiCall(style);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                generateAdventureApiCall(style, { latitude, longitude });
            },
            (error) => {
                let message = "Ocurrió un error al obtener la ubicación. Generando una aventura genérica.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Has denegado el permiso de geolocalización. Generaremos una aventura genérica en su lugar.";
                }
                setRwaError(message);
                generateAdventureApiCall(style); // Fallback to generic adventure
            }
        );
    };

    const adventureStyles: { label: AdventureStyle; color: string; icon: JSX.Element }[] = [
        { label: 'Conexión Romántica', color: 'bg-blue-500 hover:bg-blue-600', icon: <HeartIcon className="w-5 h-5 mr-2" /> },
        { label: 'Aventura Juguetona', color: 'bg-yellow-500 hover:bg-yellow-600', icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
        { label: 'Misión Atrevida', color: 'bg-red-500 hover:bg-red-600', icon: <FireIcon className="w-5 h-5 mr-2" /> },
    ];


    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <PuzzlePieceIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Aventuras y Narrativas</h2>
                <p className="mt-2 text-lg text-brand-muted">Vuestro lienzo para la fantasía, el rol y las experiencias inolvidables, dentro y fuera de casa.</p>
            </header>
             {error && <div className="my-4 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">{error}</div>}

            {/* QuestConnect 2.0 */}
            <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-brand-accent/30 mb-12">
                <div className="text-center">
                    <MapPinIcon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-accent mx-auto mb-3" />
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light">QuestConnect 2.0: Aventura Espontánea</h3>
                    <p className="text-brand-muted mt-2 mb-6 max-w-2xl mx-auto">Sacad la pasión a la calle. Elegid el tipo de misión que buscáis y usad vuestra ubicación para generar una aventura única.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {adventureStyles.map(style => (
                            <button
                                key={style.label}
                                onClick={() => handleGenerateRealWorldAdventure(style.label)}
                                disabled={isLoadingRWA}
                                className={`flex items-center justify-center text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 w-full sm:w-auto disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none ${style.color}`}
                            >
                                {style.icon}
                                {isLoadingRWA && selectedStyle === style.label ? 'Generando...' : style.label}
                            </button>
                        ))}
                    </div>
                </div>
                {isLoadingRWA && <Loader text="Analizando vuestro entorno..."/>}
                {rwaError && <div className="mt-6 bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-lg text-center">{rwaError}</div>}
                {realWorldAdventure && (
                    <div className="mt-8 bg-brand-deep-purple p-4 sm:p-6 rounded-lg animate-fade-in border border-brand-muted/20">
                        <h4 className="text-xl sm:text-2xl font-serif text-brand-accent text-center mb-4">{realWorldAdventure.title}</h4>
                        <div className="space-y-4">
                            {realWorldAdventure.steps.map((step, index) => (
                                <div key={index} className="bg-brand-navy p-4 rounded-md">
                                <h5 className="font-bold text-lg text-brand-light">{step.title}</h5>
                                <p className="text-brand-muted mb-3">{step.description}</p>
                                {step.type !== 'custom' && (
                                    <Link to={getLinkForStep(step.type)} className="text-brand-accent font-semibold hover:underline text-sm">
                                        Ir a la sección &rarr;
                                    </Link>
                                )}
                                </div>
                            ))}
                        </div>
                        <FeedbackWidget 
                            onFeedback={(feedback) => recordFeedback('real_world_adventure', realWorldAdventure.title, feedback)}
                            contentId={realWorldAdventure.title}
                        />
                    </div>
                )}
            </div>

            {/* WhisperCanvas */}
            <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10 mb-12">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light mb-4 text-center">WhisperCanvas: Creador de Escenarios</h3>
                <p className="text-brand-muted mb-6 text-center">Proponed un tema y dejad que la IA cree el punto de partida para vuestro próximo juego de rol.</p>
                <form onSubmit={handleGenerateScenario} className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input type="text" value={scenarioTheme} onChange={e => setScenarioTheme(e.target.value)} placeholder="Ej: Noche de espías en Venecia" className="w-full sm:w-1/2 bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-accent transition"/>
                    <button type="submit" disabled={isLoadingScenario} className="bg-brand-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500">
                        {isLoadingScenario ? 'Creando...' : 'Generar Escenario'}
                    </button>
                </form>
                {isLoadingScenario && <Loader text="Pintando vuestra fantasía..."/>}
                {scenario && (
                    <div className="mt-8 text-left bg-brand-deep-purple p-6 rounded-lg animate-fade-in border border-brand-accent/50">
                        <h4 className="text-2xl font-serif text-brand-accent mb-2">{scenario.title}</h4>
                        <p className="text-brand-light/90 mb-4"><strong className="text-brand-muted">Ambientación:</strong> {scenario.setting}</p>
                        <p className="text-brand-light/90 mb-2"><strong className="text-brand-muted">Personaje 1:</strong> {scenario.character1}</p>
                        <p className="text-brand-light/90 mb-4"><strong className="text-brand-muted">Personaje 2:</strong> {scenario.character2}</p>
                        <p className="text-brand-light/90 italic">"{scenario.plot}"</p>
                        <FeedbackWidget onFeedback={(feedback) => recordFeedback('roleplay_theme', scenarioTheme, feedback)} contentId={scenario.title} />
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* QuestConnect */}
                <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10">
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light mb-4 text-center">QuestConnect: Citas Originales</h3>
                    <p className="text-brand-muted mb-6 text-center">¿Sin ideas para la próxima cita? Genera una aventura a medida.</p>
                    <form onSubmit={handleGenerateDate} className="flex flex-col gap-4 items-center">
                        <select value={dateCategory} onChange={e => setDateCategory(e.target.value)} className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-accent transition">
                            <option>Romántica</option>
                            <option>Aventura</option>
                            <option>Cultural</option>
                            <option>En Casa</option>
                        </select>
                        <button type="submit" disabled={isLoadingDate} className="w-full bg-brand-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500">
                            {isLoadingDate ? 'Buscando...' : 'Sugerir Cita'}
                        </button>
                    </form>
                    {isLoadingDate && <Loader text="Planeando algo especial..."/>}
                    {dateIdea && (
                        <div className="mt-6 text-left bg-brand-deep-purple p-6 rounded-lg animate-fade-in border border-brand-accent/50">
                            <h4 className="text-xl font-serif text-brand-accent mb-2">{dateIdea.title}</h4>
                            <p className="text-brand-light/90">{dateIdea.description}</p>
                            <FeedbackWidget onFeedback={(feedback) => recordFeedback('date_category', dateCategory, feedback)} contentId={dateIdea.title} />
                        </div>
                    )}
                </div>

                {/* StoryWeaver Link */}
                <Link to="/story-weaver" className="block group">
                    <div className="bg-brand-navy rounded-xl shadow-lg border border-white/10 h-full p-8 flex flex-col justify-center items-center text-center hover:border-brand-accent/50 hover:bg-brand-deep-purple transition-colors">
                        <BookOpenIcon className="w-12 h-12 text-brand-accent mb-4" />
                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light">StoryWeaver AI</h3>
                        <p className="text-brand-muted mt-2 mb-4">Cread vuestras propias historias eróticas personalizadas. Elegid los ingredientes y dejad que la IA teja un relato para vosotros.</p>
                        <span className="font-semibold text-brand-accent group-hover:underline">
                            Ir al creador de historias &rarr;
                        </span>
                    </div>
                </Link>
            </div>

        </div>
    );
};

export default Adventures;