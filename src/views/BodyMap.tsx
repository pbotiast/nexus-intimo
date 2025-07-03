import React, { useState, useEffect } from 'react';
import { BodyMark, SensationType } from '../types';
import { BodyIcon, BodyFrontIcon, BodyBackIcon, XMarkIcon } from '../components/Icons';
import Modal from '../components/Modal';
import { useCouple } from '../contexts/CoupleContext';

const sensationTypes: SensationType[] = [
    'Beso Suave',
    'Caricia Ligera',
    'Masaje Profundo',
    'Mordisco Juguetón',
    'Zona Erógena Principal'
];

const sensationStyles: Record<SensationType, { color: string; label: string }> = {
    'Beso Suave': { color: 'bg-pink-400', label: 'Beso Suave' },
    'Caricia Ligera': { color: 'bg-blue-400', label: 'Caricia Ligera' },
    'Masaje Profundo': { color: 'bg-purple-500', label: 'Masaje Profundo' },
    'Mordisco Juguetón': { color: 'bg-orange-500', label: 'Mordisco Juguetón' },
    'Zona Erógena Principal': { color: 'bg-red-500', label: 'Zona Erógena Principal' }
};


const BodyMap: React.FC = () => {
    const { coupleData, api } = useCouple();
    const marks = coupleData?.bodyMarks || [];
    const [view, setView] = useState<'front' | 'back'>('front');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMark, setSelectedMark] = useState<BodyMark | null>(null);
    const [newCoords, setNewCoords] = useState<{ x: number; y: number } | null>(null);
    const [sensation, setSensation] = useState<SensationType>('Beso Suave');
    const [note, setNote] = useState('');

    const currentMarks = marks.filter(mark => mark.bodySide === view);
    
    const setMarks = (newMarks: BodyMark[] | ((prev: BodyMark[]) => BodyMark[])) => {
        const updatedMarks = typeof newMarks === 'function' ? newMarks(marks) : newMarks;
        api.updateBodyMarks({ marks: updatedMarks });
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMark(null);
        setNewCoords(null);
        setNote('');
        setSensation('Beso Suave');
    };

    const handleBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const tooClose = currentMarks.some(mark => {
            const dx = (mark.x - x) * (rect.width / 100);
            const dy = (mark.y - y) * (rect.height / 100);
            return (dx * dx + dy * dy) < (12 * 12);
        });
        
        if (tooClose) return;

        setNewCoords({ x, y });
        setSelectedMark(null);
        setIsModalOpen(true);
    };

    const handleMarkClick = (e: React.MouseEvent<HTMLDivElement>, mark: BodyMark) => {
        e.stopPropagation();
        setSelectedMark(mark);
        setSensation(mark.sensation);
        setNote(mark.note);
        setNewCoords(null);
        setIsModalOpen(true);
    };

    const handleSaveMark = () => {
        if (selectedMark) { // Editing existing mark
            setMarks(marks.map(m => m.id === selectedMark.id ? { ...m, sensation, note } : m));
        } else if (newCoords) { // Creating new mark
            const newMark: BodyMark = {
                id: new Date().toISOString(),
                x: newCoords.x,
                y: newCoords.y,
                bodySide: view,
                sensation,
                note
            };
            setMarks([...marks, newMark]);
        }
        closeModal();
    };

    const handleDeleteMark = () => {
        if (selectedMark && window.confirm('¿Seguro que quieres borrar esta marca?')) {
            setMarks(marks.filter(m => m.id !== selectedMark.id));
            closeModal();
        }
    };
    
    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <BodyIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">El Mapa del Cuerpo</h2>
                <p className="mt-2 text-lg text-brand-muted">Vuestra geografía del placer. Haced clic en el cuerpo para añadir una marca de sensación.</p>
            </header>
            
            <div className="flex justify-center mb-6">
                <div className="bg-brand-navy p-1 rounded-lg flex gap-1">
                    <button onClick={() => setView('front')} className={`px-6 py-2 rounded-md transition-colors ${view === 'front' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:bg-brand-deep-purple'}`}>Vista Frontal</button>
                    <button onClick={() => setView('back')} className={`px-6 py-2 rounded-md transition-colors ${view === 'back' ? 'bg-brand-accent text-white' : 'text-brand-muted hover:bg-brand-deep-purple'}`}>Vista Trasera</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 bg-brand-navy p-4 rounded-xl shadow-lg border border-white/10">
                    <div 
                        className="relative w-full max-w-sm mx-auto cursor-crosshair"
                        onClick={handleBodyClick}
                    >
                        {view === 'front' ? 
                            <BodyFrontIcon className="w-full h-auto text-brand-muted/40 fill-current" /> : 
                            <BodyBackIcon className="w-full h-auto text-brand-muted/40 fill-current" />
                        }
                        {currentMarks.map(mark => (
                           <div
                                key={mark.id}
                                style={{
                                    left: `${mark.x}%`,
                                    top: `${mark.y}%`,
                                }}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white/50 cursor-pointer flex items-center justify-center group ${sensationStyles[mark.sensation].color}`}
                                onClick={(e) => handleMarkClick(e, mark)}
                            >
                                <div className="absolute bottom-full mb-2 w-max bg-brand-deep-purple text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <strong className="block">{mark.sensation}</strong>
                                    {mark.note && <span>{mark.note}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-brand-navy p-6 rounded-xl shadow-lg border border-white/10">
                    <h3 className="text-xl font-serif text-brand-light mb-4">Leyenda</h3>
                    <div className="space-y-2">
                        {sensationTypes.map(type => (
                            <div key={type} className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full ${sensationStyles[type].color}`}></div>
                                <span className="text-brand-muted text-sm">{sensationStyles[type].label}</span>
                            </div>
                        ))}
                    </div>
                     <p className="text-xs text-brand-muted/70 mt-6">Pasa el ratón sobre una marca para ver los detalles. Haz clic para editar o borrar.</p>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-serif font-bold text-brand-light">
                        {selectedMark ? 'Editar Marca' : 'Añadir Marca'}
                    </h3>
                    <button onClick={closeModal} className="text-brand-muted hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="sensation" className="block text-sm font-medium text-brand-muted mb-1">Tipo de Sensación</label>
                        <select
                            id="sensation"
                            value={sensation}
                            onChange={e => setSensation(e.target.value as SensationType)}
                            className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-accent"
                        >
                            {sensationTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-brand-muted mb-1">Nota Secreta (opcional)</label>
                        <textarea
                            id="note"
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Ej: 'Aquí me derrito...'"
                            className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-accent"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-between items-center gap-3">
                     <div>
                        {selectedMark && (
                            <button onClick={handleDeleteMark} className="bg-red-800/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm">
                                Borrar
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={closeModal} className="bg-brand-navy hover:bg-brand-navy/70 text-white font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
                        <button onClick={handleSaveMark} className="bg-brand-accent hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition">Guardar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BodyMap;
