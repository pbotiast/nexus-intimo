import React, { useState } from 'react';
import type { Wish } from '../src/types';
import { useCouple } from '../src/contexts/CoupleContext';
import { ChestIcon, KeyIcon } from '../src/components/Icons';
import Modal from '../src/components/Modal';
import FeedbackWidget from '../src/components/FeedbackWidget';
import { useAiPreferences } from '../src/hooks/useAiPreferences';
import Loader from '../src/components/Loader';
import { showInfoModal } from '../src/components/InfoModal';

const WishChest: React.FC = () => {
    const { coupleData, api } = useCouple();
    const [newWishText, setNewWishText] = useState('');
    const [revealedWish, setRevealedWish] = useState<Wish | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isRevealing, setIsRevealing] = useState(false);

    const { recordFeedback } = useAiPreferences();

    const wishes = coupleData?.wishes || [];
    const keys = coupleData?.keys || 0;

    const handleAddWish = async () => {
        if (!newWishText.trim()) {
            setError('El deseo no puede estar vacío.');
            return;
        }
        setIsAdding(true);
        setError(null);
        try {
            await api.addWish({ text: newWishText.trim() });
            setNewWishText('');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRevealWish = async () => {
        if (wishes.length === 0) {
            showInfoModal('Cofre Vacío', 'El cofre está vacío. ¡Añadid primero vuestros deseos para poder desvelarlos!');
            return;
        }
        if (keys <= 0) {
            showInfoModal('¡Sin Llaves!', 'Necesitáis una Llave de la Confianza para abrir el cofre. Ganad llaves completando misiones y actividades en la app.');
            return;
        }
        
        setIsRevealing(true);
        try {
            const wishToReveal = await api.revealWish();
            if (wishToReveal) {
                setRevealedWish(wishToReveal);
                setIsModalOpen(true);
            } else {
                 showInfoModal('Algo fue mal', 'No se pudo revelar un deseo. ¿Quizás alguien ya lo hizo o no quedan deseos?');
            }
        } catch (e: any) {
             showInfoModal('Error', e.message);
        } finally {
            setIsRevealing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in text-center">
            <header className="mb-10">
                <ChestIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">El Cofre de los Deseos</h2>
                <p className="mt-2 text-lg text-brand-muted max-w-2xl mx-auto">Depositad vuestros secretos más profundos. Ganad llaves para desvelar vuestras fantasías y encender la conversación.</p>
            </header>

            <div className="mb-12 flex items-center justify-center gap-4 bg-brand-deep-purple p-4 rounded-full max-w-xs mx-auto border border-yellow-400/50">
                <KeyIcon className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">Llaves de la Confianza: {keys}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Wish Section */}
                <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10">
                    <h3 className="text-xl sm:text-2xl font-serif text-brand-light mb-4">Deposita un Deseo Secreto</h3>
                    <p className="text-brand-muted mb-4 text-sm">Escribe una fantasía, un deseo o una curiosidad. Tu pareja no lo verá hasta que abráis el cofre juntos.</p>
                    <textarea
                        value={newWishText}
                        onChange={(e) => setNewWishText(e.target.value)}
                        placeholder="Ej: 'Me excita la idea de que me vendes los ojos...'"
                        rows={4}
                        className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-3 text-brand-light focus:ring-2 focus:ring-brand-accent transition"
                        disabled={isAdding}
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button
                        onClick={handleAddWish}
                        disabled={isAdding}
                        className="mt-4 w-full bg-brand-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-600 flex items-center justify-center"
                    >
                        {isAdding ? <Loader text="" /> : 'Guardar Deseo en el Cofre'}
                    </button>
                </div>

                {/* Open Chest Section */}
                <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10 flex flex-col items-center justify-center">
                     <h3 className="text-xl sm:text-2xl font-serif text-brand-light mb-4">¿Listos para la sorpresa?</h3>
                     <p className="text-brand-muted mb-4 text-sm">Usad una de vuestras Llaves de la Confianza para revelar un deseo al azar del cofre.</p>
                     <p className="text-brand-muted mb-6 font-bold">{wishes.length} {wishes.length === 1 ? 'deseo esperando' : 'deseos esperando'} a ser descubiertos.</p>
                     <button
                        onClick={handleRevealWish}
                        disabled={keys === 0 || wishes.length === 0 || isRevealing}
                        className="w-full bg-yellow-500 text-brand-deep-purple font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isRevealing ? <Loader text="" /> : <><KeyIcon className="w-5 h-5"/> Usar una Llave y Abrir el Cofre</>}
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {revealedWish && (
                     <>
                        <span className="text-sm font-bold text-brand-accent uppercase tracking-wider">Un Deseo Revelado...</span>
                        <p className="font-serif text-2xl sm:text-3xl text-brand-light my-4 text-center">"{revealedWish.text}"</p>
                        <p className="text-brand-muted text-sm mb-6">Este es un punto de partida para una conversación, no una exigencia. Explorad juntos qué os evoca esta idea.</p>
                        <FeedbackWidget 
                            onFeedback={(feedback) => recordFeedback('wish', 'revealed_wish', feedback)}
                            contentId={revealedWish.id}
                        />
                         <button onClick={() => setIsModalOpen(false)} className="w-full bg-brand-accent hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition mt-6">
                            Cerrar y Conversar
                        </button>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default WishChest;