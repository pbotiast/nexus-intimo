import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAiPreferences } from '../hooks/useAiPreferences';
import { CompassIcon, SparklesIcon } from '../components/Icons';
import PassionCompass from '../components/PassionCompass';
import Loader from '../components/Loader';
import FeedbackWidget from '../components/FeedbackWidget';
import type { PassionCompassScores, SoulReflection, PassionPillar, StampCategory } from '../types';
import { useCouple } from '../contexts/CoupleContext';

const pillarMapping: Record<StampCategory, PassionPillar> = {
    'Cita Memorable': 'Conexión Emocional',
    'Logro Personal': 'Conexión Emocional',
    'Lugar Inusual': 'Aventura y Novedad',
    'Juego de Rol': 'Juego y Diversión',
    'Fantasía Cumplida': 'Fantasía e Intensidad',
    'Postura Nueva': 'Fantasía e Intensidad',
};

const preferenceMapping: Record<string, PassionPillar> = {
    'ritual_energy:Conexión Tierna': 'Conexión Emocional',
    'challenge_type:Pregunta Íntima': 'Conexión Emocional',
    'date_category:Aventura': 'Aventura y Novedad',
    'real_world_adventure': 'Aventura y Novedad',
    'mission_title': 'Aventura y Novedad',
    'ritual_energy:Juego y Diversión': 'Juego y Diversión',
    'challenge_level:Picante': 'Juego y Diversión',
    'story_theme': 'Fantasía e Intensidad',
    'story_intensity': 'Fantasía e Intensidad',
    'ritual_energy:Pasión Intensa': 'Fantasía e Intensidad',
    'wish': 'Fantasía e Intensidad',
};

const SoulMirror: React.FC = () => {
    const { coupleData, api } = useCouple();
    const { preferences, recordFeedback } = useAiPreferences();

    const [reflection, setReflection] = useState<SoulReflection | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const compassScores = useMemo<PassionCompassScores>(() => {
        const scores: PassionCompassScores = {
            'Conexión Emocional': 0,
            'Aventura y Novedad': 0,
            'Juego y Diversión': 0,
            'Fantasía e Intensidad': 0,
        };
        
        const stamps = coupleData?.stamps || [];
        
        let totalPoints = 0;

        stamps.forEach(stamp => {
            const pillar = pillarMapping[stamp.category];
            if (pillar) {
                scores[pillar] += 10;
                totalPoints += 10;
            }
        });

        Object.entries(preferences).forEach(([key, value]) => {
            const baseKey = key.split(':')[0];
            const pillar = preferenceMapping[key] || preferenceMapping[baseKey];
            if (pillar && value > 0) {
                const points = value * 5;
                scores[pillar] += points;
                totalPoints += points;
            }
        });

        if (totalPoints === 0) {
            return {
                'Conexión Emocional': 15,
                'Aventura y Novedad': 15,
                'Juego y Diversión': 15,
                'Fantasía e Intensidad': 15,
            };
        }

        const maxScore = Math.max(...Object.values(scores));
        if (maxScore > 0) {
          for (const pillar in scores) {
              scores[pillar as PassionPillar] = Math.round((scores[pillar as PassionPillar] / maxScore) * 90) + 10;
          }
        }
        
        return scores;

    }, [coupleData?.stamps, preferences]);

    const handleGenerateReflection = async () => {
        setIsLoading(true);
        setError(null);
        setReflection(null);
        try {
            const result = await api.generateSoulMirrorReflection({ scores: compassScores });
            setReflection(result);
        } catch (err: any) {
            setError(err.message || 'No se pudo generar la reflexión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <CompassIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">El Espejo del Alma</h2>
                <p className="mt-2 text-lg text-brand-muted">Un reflejo de vuestra conexión. Descubrid lo que vuestras aventuras y deseos dicen de vosotros.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10 mb-12">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl sm:text-3xl font-serif text-brand-light mb-4">Vuestra Brújula de la Pasión</h3>
                    <p className="text-brand-muted mb-4">Esta brújula visualiza las energías que más habéis explorado. Es un mapa en constante cambio que refleja vuestros enfoques y deseos actuales.</p>
                    <p className="text-sm text-brand-muted/70">Las puntuaciones se basan en vuestros sellos del pasaporte y las interacciones con la IA.</p>
                </div>
                <div>
                    <PassionCompass scores={compassScores} />
                </div>
            </div>

            <section className="bg-gradient-to-tr from-brand-accent/10 via-brand-navy to-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-brand-accent/30">
                <div className="text-center">
                    <SparklesIcon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-accent mx-auto mb-3" />
                    <h3 className="text-3xl sm:text-4xl font-serif text-brand-light">Reflexiones de Nexo</h3>
                    <p className="text-brand-muted mt-2 mb-6 max-w-2xl mx-auto">¿Listos para una interpretación poética de vuestro viaje? Dejad que Nexo analice vuestra brújula y os ofrezca una visión inspiradora.</p>
                    <button onClick={handleGenerateReflection} disabled={isLoading} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500">
                        {isLoading ? 'Consultando el espejo...' : 'Generar Nuestra Reflexión'}
                    </button>
                </div>

                {isLoading && <Loader text="Nexo está observando las estrellas..."/>}
                {error && <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">{error}</div>}
                
                {reflection && (
                    <article className="mt-10 bg-brand-deep-purple p-4 sm:p-8 rounded-xl shadow-inner border border-white/10 animate-fade-in">
                        <h3 className="font-serif text-2xl sm:text-3xl text-brand-accent text-center mb-6">{reflection.title}</h3>
                        <div className="prose sm:prose-lg prose-invert max-w-none text-brand-light/90 space-y-4">
                            {reflection.content.map((paragraph, index) => (
                            <p key={index} className="text-justify leading-relaxed">{paragraph}</p>
                            ))}
                        </div>

                        {reflection.invitations && reflection.invitations.length > 0 && (
                            <div className="mt-8 border-t border-brand-accent/20 pt-6">
                                <h4 className="text-lg font-bold text-brand-light text-center mb-4">Invitaciones para Vosotros</h4>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    {reflection.invitations.map((invite, index) => (
                                        <Link key={index} to={invite.link} className="block text-center bg-brand-navy hover:bg-brand-accent/20 text-brand-accent font-semibold py-3 px-5 rounded-lg transition-colors">
                                            {invite.text} &rarr;
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <FeedbackWidget onFeedback={(feedback) => recordFeedback('soul_reflection', reflection.title, feedback)} contentId={reflection.title} />
                    </article>
                )}
            </section>

        </div>
    );
};

export default SoulMirror;
