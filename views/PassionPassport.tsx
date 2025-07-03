import React, { useState, useMemo } from 'react';
import type { Achievement, IntimateChronicle, PassionStamp } from '../src/types';
import { PassportIcon, SparklesIcon, DocumentTextIcon } from '../src/components/Icons';
import { useCouple } from '../src/contexts/CoupleContext';
import Loader from '../src/components/Loader';
import FeedbackWidget from '../src/components/FeedbackWidget';
import { useAiPreferences } from '../src/hooks/useAiPreferences';
import { openPassportModal } from '../src/components/PassportModal';
import { showConfirmModal } from '../src/components/ConfirmModal';

const allAchievements: Omit<Achievement, 'isUnlocked'>[] = [
    { id: 'first_stamp', title: 'Primer Paso', description: 'Has añadido vuestro primer recuerdo al pasaporte. ¡El viaje ha comenzado!' },
    { id: 'explorer', title: 'Explorador/a Intrépido/a', description: 'Habéis probado 3 posturas nuevas. ¡La variedad es la sal de la vida!' },
    { id: 'dreamer', title: 'Soñador/a Cumplido/a', description: 'Habéis hecho realidad vuestra primera fantasía. ¿Cuál será la siguiente?' },
    { id: 'adventurer', title: 'Aventurero/a Global', description: 'Habéis registrado 3 lugares inusuales. ¡Vuestro mapa de pasión se expande!' },
    { id: 'storyteller', title: 'Narrador/a de Historias', description: 'Habéis completado 3 juegos de rol. Vuestra imaginación no tiene límites.'},
    { id: 'collector', title: 'Coleccionista de Momentos', description: 'Habéis acumulado 10 sellos en total. ¡Vuestra historia íntima es cada vez más rica!'},
];


const PassionPassport: React.FC = () => {
    const { coupleData, api } = useCouple();
    const stamps = coupleData?.stamps || [];
    
    const [chronicle, setChronicle] = useState<IntimateChronicle | null>(null);
    const [isChronicleLoading, setIsChronicleLoading] = useState(false);
    const [chronicleError, setChronicleError] = useState<string | null>(null);
        
    const { recordFeedback } = useAiPreferences();

    const handleDelete = (id: string) => {
        showConfirmModal(
            '¿Confirmar borrado?', 
            'Este recuerdo se eliminará para siempre. Esta acción no se puede deshacer.',
            () => api.deleteStamp(id)
        );
    };

    const achievements: Achievement[] = useMemo(() => allAchievements.map(ach => ({
        ...ach,
        isUnlocked: (currentStamps: PassionStamp[]): boolean => {
            switch(ach.id) {
                case 'first_stamp': return currentStamps.length >= 1;
                case 'explorer': return currentStamps.filter(s => s.category === 'Postura Nueva').length >= 3;
                case 'dreamer': return currentStamps.filter(s => s.category === 'Fantasía Cumplida').length >= 1;
                case 'adventurer': return currentStamps.filter(s => s.category === 'Lugar Inusual').length >= 3;
                case 'storyteller': return currentStamps.filter(s => s.category === 'Juego de Rol').length >= 3;
                case 'collector': return currentStamps.length >= 10;
                default: return false;
            }
        }
    })), [stamps]);

    const handleGenerateChronicle = async () => {
        setIsChronicleLoading(true);
        setChronicleError(null);
        setChronicle(null);
        try {
            const result = await api.generateIntimateChronicle();
            setChronicle(result);
        } catch (err: any) {
            setChronicleError(err.message || 'No se pudo generar la crónica.');
        } finally {
            setIsChronicleLoading(false);
        }
    }


    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <PassportIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Pasaporte de la Pasión</h2>
                <p className="mt-2 text-lg text-brand-muted">Vuestro diario de hitos íntimos. Cread un legado visual de vuestra conexión y aventuras.</p>
            </header>
            
            <div className="text-center mb-12">
                 <button onClick={() => openPassportModal()} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 shadow-lg">
                    Añadir Nuevo Sello al Pasaporte
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h3 className="text-2xl sm:text-3xl font-serif text-brand-light mb-6">Vuestros Recuerdos Íntimos</h3>
                    {stamps.length === 0 ? (
                        <div className="text-center bg-brand-navy p-8 rounded-xl border border-dashed border-brand-muted/50">
                            <p className="text-brand-muted">Vuestro pasaporte está esperando su primer sello.</p>
                            <p className="text-sm text-brand-muted/70">Añadid una cita memorable, una fantasía cumplida o cualquier hito que queráis recordar.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[...stamps].sort((a,b) => new Date(b.id).getTime() - new Date(a.id).getTime()).map(stamp => (
                                <div key={stamp.id} className="bg-brand-navy p-5 rounded-lg border border-brand-muted/20 relative group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">{stamp.category}</span>
                                            <h4 className="text-lg sm:text-xl font-serif text-brand-light mt-1">{stamp.title}</h4>
                                            {stamp.notes && <p className="text-sm text-brand-muted mt-2">{stamp.notes}</p>}
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="text-xs text-brand-muted">{stamp.date}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(stamp.id)} className="absolute top-2 right-2 text-brand-muted/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                        Borrar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                     <h3 className="text-2xl sm:text-3xl font-serif text-brand-light mb-6">Logros Desbloqueados</h3>
                     <div className="space-y-4">
                        {achievements.map(ach => {
                            const unlocked = ach.isUnlocked(stamps);
                            return (
                                <div key={ach.id} className={`bg-brand-navy p-4 rounded-lg border-l-4 transition-all duration-500 ${unlocked ? 'border-brand-accent' : 'border-brand-muted/30'}`}>
                                    <div className={`flex items-center gap-4 ${!unlocked ? 'opacity-50' : ''}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${unlocked ? 'bg-brand-accent' : 'bg-brand-muted/30'}`}>
                                            <SparklesIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-light">{ach.title}</h4>
                                            <p className="text-sm text-brand-muted">{ach.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            </div>

            {stamps.length >= 5 && (
                <section className="mt-16 bg-gradient-to-tr from-brand-accent/10 via-brand-navy to-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-brand-accent/30">
                    <div className="text-center">
                        <DocumentTextIcon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-accent mx-auto mb-3" />
                        <h3 className="text-3xl sm:text-4xl font-serif text-brand-light">Vuestra Crónica Íntima</h3>
                        <p className="text-brand-muted mt-2 mb-6 max-w-2xl mx-auto">Habéis acumulado suficientes recuerdos. ¿Listos para ver lo que vuestro viaje dice sobre vosotros? Dejad que la IA os lea vuestra historia.</p>
                        <button onClick={handleGenerateChronicle} disabled={isChronicleLoading} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500">
                            {isChronicleLoading ? 'Analizando vuestro viaje...' : 'Generar Nuestra Crónica Íntima'}
                        </button>
                    </div>

                    {isChronicleLoading && <Loader text="Consultando al cronista..."/>}
                    {chronicleError && <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">{chronicleError}</div>}
                    
                    {chronicle && (
                        <article className="mt-10 bg-brand-deep-purple p-4 sm:p-8 rounded-xl shadow-inner border border-white/10 animate-fade-in">
                            <h3 className="font-serif text-2xl sm:text-3xl text-brand-accent text-center mb-6">{chronicle.title}</h3>
                            <div className="prose sm:prose-lg prose-invert max-w-none text-brand-light/90 space-y-4">
                                {chronicle.content.map((paragraph, index) => (
                                <p key={index} className="text-justify leading-relaxed">{paragraph}</p>
                                ))}
                            </div>
                            <FeedbackWidget onFeedback={(feedback) => recordFeedback('intimate_chronicle', chronicle.title, feedback)} contentId={chronicle.title} />
                        </article>
                    )}
                </section>
            )}
        </div>
    );
};

export default PassionPassport;