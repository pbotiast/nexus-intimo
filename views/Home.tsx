import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../src/components/Card';
import Loader from '../src/components/Loader';
import type { IntimateRitual, RitualEnergy, RitualStepType } from '../src/types';
import { HeartIcon, BookOpenIcon, UsersIcon, PuzzlePieceIcon, FireIcon, MapIcon, PassportIcon, SpeakerWaveIcon, MagicWandIcon, TrophyIcon, ChestIcon, KeyIcon, BodyIcon, CompassIcon, DocumentDuplicateIcon } from '../src/components/Icons';
import FeedbackWidget from '../src/components/FeedbackWidget';
import { useAiPreferences } from '../src/hooks/useAiPreferences';
import { useCouple } from '../src/contexts/CoupleContext';
import { showInfoModal } from '../src/components/InfoModal';

const features = [
  {
    title: "Espejo del Alma",
    description: "Un reflejo de vuestra conexión. La IA analiza vuestro viaje y os ofrece una visión poética de vuestra intimidad.",
    linkTo: "/soul-mirror",
    imageUrl: "https://picsum.photos/seed/soul/400/300",
    icon: <CompassIcon className="w-6 h-6" />
  },
  {
    title: "Mi Placer, Mi Viaje",
    description: "Un viaje de autoconocimiento. Explora tu cuerpo, aprende sobre tu placer y empodérate en tu sexualidad.",
    linkTo: "/my-journey",
    imageUrl: "https://picsum.photos/seed/journey/400/300",
    icon: <HeartIcon className="w-6 h-6" />
  },
  {
    title: "Diario Tándem",
    description: "Responded a la misma pregunta en privado. Las respuestas se revelan a la vez, creando un momento de empatía y descubrimiento.",
    linkTo: "/tandem-journal",
    imageUrl: "https://picsum.photos/seed/tandem/400/300",
    icon: <DocumentDuplicateIcon className="w-6 h-6" />
  },
   {
    title: "El Sendero del Deseo",
    description: "Un juego de tablero erótico para parejas. Lanza el dado, avanza y descubre retos y preguntas que encenderán la pasión.",
    linkTo: "/desire-path",
    imageUrl: "https://picsum.photos/seed/path/400/300",
    icon: <MapIcon className="w-6 h-6" />
  },
  {
    title: "Mapa del Cuerpo",
    description: "Cread un mapa visual de vuestras zonas de placer. Marcad puntos, añadid sensaciones y notas para crear vuestra geografía íntima.",
    linkTo: "/body-map",
    imageUrl: "https://picsum.photos/seed/bodymap/400/300",
    icon: <BodyIcon className="w-6 h-6" />
  },
  {
    title: "Cofre de los Deseos",
    description: "Gana llaves usando la app y desvela los deseos secretos de tu pareja. Un juego de misterio, confianza y comunicación.",
    linkTo: "/wish-chest",
    imageUrl: "https://picsum.photos/seed/chest/400/300",
    icon: <ChestIcon className="w-6 h-6" />
  },
  {
    title: "Guías Sensoriales",
    description: "Sumérgete en un viaje a través del sonido. Audios para meditar, conectar y guiar vuestras caricias.",
    linkTo: "/audio-guides",
    imageUrl: "https://picsum.photos/seed/audio/400/300",
    icon: <SpeakerWaveIcon className="w-6 h-6" />
  },
  {
    title: "Pasaporte de la Pasión",
    description: "Vuestro diario íntimo de aventuras. Registrad hitos, fantasías cumplidas y cread un mapa de vuestra conexión.",
    linkTo: "/passion-passport",
    imageUrl: "https://picsum.photos/seed/passport/400/300",
    icon: <PassportIcon className="w-6 h-6" />
  },
  {
    title: "Aventuras y Narrativas",
    description: "Explora fantasías, juegos de rol y citas originales. Convierte cada encuentro en una aventura inolvidable.",
    linkTo: "/adventures",
    imageUrl: "https://picsum.photos/seed/adventure/400/300",
    icon: <PuzzlePieceIcon className="w-6 h-6" />
  },
   {
    title: "Dados Íntimos",
    description: "Deja que el azar encienda la pasión. Tira los dados digitales y descubre nuevas formas de placer y juego.",
    linkTo: "/sex-dice",
    imageUrl: "https://picsum.photos/seed/dice/400/300",
    icon: <FireIcon className="w-6 h-6" />
  },
  {
    title: "StoryWeaver AI",
    description: "Crea historias eróticas personalizadas con la IA. Elige los temas y deja que la imaginación vuele.",
    linkTo: "/story-weaver",
    imageUrl: "https://picsum.photos/seed/story/400/300",
    icon: <BookOpenIcon className="w-6 h-6" />
  },
];

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

// Helper para obtener el número de la semana del año
const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const Home: React.FC = () => {
  const { api, coupleData } = useCouple();
  
  // State for Ritual (local, not synced)
  const [ritual, setRitual] = useState<IntimateRitual | null>(null);
  const [isRitualLoading, setIsRitualLoading] = useState(false);
  const [ritualError, setRitualError] = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<RitualEnergy | null>(null);
  
  // State for Weekly Mission (synced)
  const [isMissionLoading, setIsMissionLoading] = useState(false);
  const [missionError, setMissionError] = useState<string | null>(null);
  const { recordFeedback } = useAiPreferences();

  const storedMission = coupleData?.weeklyMission;
  
  const currentWeek = useMemo(() => getWeekNumber(new Date()), []);
  const showMission = storedMission?.weekNumber === currentWeek;
  
  const sortedFeatures = useMemo(() => {
    const mainOrder = ["Espejo del Alma", "Mi Placer, Mi Viaje", "Diario Tándem"];
    const mainFeatures = mainOrder.map(title => features.find(f => f.title === title)).filter(Boolean);
    const otherFeatures = features.filter(f => !mainOrder.includes(f.title));
    return [...mainFeatures, ...otherFeatures] as typeof features;
  }, []);

  const handleGenerateRitual = async (energy: RitualEnergy) => {
    setIsRitualLoading(true);
    setRitualError(null);
    setRitual(null);
    setSelectedEnergy(energy);
    try {
      const result = await api.generateIntimateRitual({ energy });
      setRitual(result);
    } catch (err: any) {
      setRitualError(err.message || 'Ocurrió un error al generar el ritual.');
    } finally {
      setIsRitualLoading(false);
    }
  };

  const handleGenerateMission = async () => {
      setIsMissionLoading(true);
      setMissionError(null);
      try {
          await api.generateWeeklyMission();
      } catch (err: any) {
          setMissionError(err.message || 'No se pudo cargar la misión de la semana.');
      } finally {
          setIsMissionLoading(false);
      }
  };

  const handleClaimMissionReward = async () => {
    if (storedMission && !storedMission.claimed) {
        await api.claimMissionReward();
        showInfoModal('¡Recompensa Obtenida!', 'Habéis ganado una Llave de la Confianza. Usadla en el Cofre de los Deseos para desvelar un secreto.');
    }
  }

  const energyOptions: { label: RitualEnergy; color: string }[] = [
    { label: 'Conexión Tierna', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Juego y Diversión', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { label: 'Pasión Intensa', color: 'bg-red-500 hover:bg-red-600' },
  ];

  return (
    <div className="animate-fade-in">
      <header className="mb-10 text-center">
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Bienvenida a <span className="text-brand-accent">Nexus Íntimo</span></h2>
        <p className="mt-2 text-base sm:text-lg text-brand-muted max-w-3xl mx-auto">Tu universo de placer, conexión y autodescubrimiento.</p>
      </header>
      
      {/* Ritual Íntimo Section */}
      <section className="mb-12 bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-brand-accent/20">
        <div className="text-center">
            <MagicWandIcon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-accent mx-auto mb-3" />
            <h3 className="text-3xl sm:text-4xl font-serif text-brand-light">El Ritual Íntimo</h3>
            <p className="text-brand-muted mt-2 mb-6 max-w-2xl mx-auto text-sm sm:text-base">¿No sabéis por dónde empezar? Elegid la energía que buscáis hoy y dejad que la IA cree un plan personalizado para vosotros.</p>
        </div>

        {!ritual && !isRitualLoading && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                {energyOptions.map(opt => (
                    <button 
                        key={opt.label}
                        onClick={() => handleGenerateRitual(opt.label)} 
                        className={`text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 ${opt.color} w-full sm:w-auto`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        )}
        
        {isRitualLoading && <Loader text="Creando vuestro ritual..."/>}
        
        {ritualError && <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">{ritualError}</div>}

        {ritual && (
            <div className="mt-8 bg-brand-deep-purple p-4 sm:p-6 rounded-lg animate-fade-in border border-brand-muted/20">
                <h4 className="text-2xl sm:text-3xl font-serif text-brand-accent text-center mb-6">{ritual.title}</h4>
                <div className="space-y-4">
                    {ritual.steps.map((step, index) => (
                        <div key={index} className="bg-brand-navy p-4 rounded-md">
                           <h5 className="font-bold text-lg text-brand-light">{step.title}</h5>
                           <p className="text-brand-muted mb-3">{step.description}</p>
                           <Link to={getLinkForStep(step.type)} className="text-brand-accent font-semibold hover:underline text-sm">
                            Ir a la sección &rarr;
                           </Link>
                        </div>
                    ))}
                </div>
                 <FeedbackWidget 
                    onFeedback={(feedback) => {
                      if (selectedEnergy) {
                        recordFeedback('ritual_energy', selectedEnergy, feedback);
                      }
                    }}
                    contentId={ritual.title}
                 />
                 <div className="text-center mt-6">
                    <button onClick={() => setRitual(null)} className="text-brand-muted hover:text-white transition-colors py-2 px-4 rounded-md text-sm">
                        Crear otro ritual
                    </button>
                </div>
            </div>
        )}
      </section>

      {/* Weekly Mission Section */}
      <section className="mb-12 bg-gradient-to-br from-yellow-500/10 via-brand-navy to-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-yellow-400/30">
        <div className="text-center">
            <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-3xl sm:text-4xl font-serif text-brand-light">Misión de la Semana</h3>
            <p className="text-brand-muted mt-2 mb-6 max-w-2xl mx-auto text-sm sm:text-base">Un objetivo semanal único generado por la IA para mantener la llama encendida. ¿Aceptáis el reto?</p>
        </div>

        {isMissionLoading && <Loader text="Generando vuestra misión semanal..." />}
        {missionError && <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">{missionError}</div>}
        
        {!isMissionLoading && !missionError && (
          <>
            {showMission && storedMission ? (
              <div className="mt-8 bg-brand-deep-purple p-4 sm:p-6 rounded-lg animate-fade-in border border-brand-muted/20">
                  <h4 className="text-2xl sm:text-3xl font-serif text-yellow-400 text-center mb-6">{storedMission.mission.title}</h4>
                  <div className="space-y-4">
                      {storedMission.mission.steps.map((step, index) => (
                          <div key={index} className="bg-brand-navy p-4 rounded-md flex items-center gap-4">
                              <div className="bg-yellow-500/80 text-brand-deep-purple font-bold rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center">{index + 1}</div>
                              <div>
                                 <h5 className="font-bold text-lg text-brand-light">{step.title}</h5>
                                 <p className="text-brand-muted mb-2 text-sm">{step.description}</p>
                                 <Link to={getLinkForStep(step.type)} className="text-brand-accent font-semibold hover:underline text-sm">
                                  Realizar este paso &rarr;
                                 </Link>
                             </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-6 text-center">
                      <button 
                          onClick={handleClaimMissionReward} 
                          disabled={storedMission.claimed}
                          className="bg-yellow-500 text-brand-deep-purple font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 mx-auto"
                      >
                          <KeyIcon className="w-5 h-5"/>
                          {storedMission.claimed ? 'Recompensa Reclamada' : 'Completar Misión y Reclamar Llave'}
                      </button>
                  </div>
                   <FeedbackWidget 
                      onFeedback={(feedback) => {
                          recordFeedback('mission_title', storedMission.mission.title, feedback);
                      }}
                      contentId={storedMission.mission.title}
                   />
              </div>
            ) : (
              <div className="text-center mt-4">
                <button 
                  onClick={handleGenerateMission}
                  className="bg-yellow-500 text-brand-deep-purple font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-500"
                  disabled={isMissionLoading}
                >
                  Generar Misión para esta Semana
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Other Features Section */}
      <h3 className="text-2xl sm:text-3xl font-serif text-brand-light text-center mb-8">O explora nuestras herramientas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFeatures.map((feature) => (
          <Card key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default Home;