import React, { useState, useEffect, useMemo } from 'react';
import { board } from '../data/board';
import type { GameChallenge, BoardSquareType } from '../src/types';
import Modal from '../src/components/Modal';
import Loader from '../src/components/Loader';
import { MapIcon, SparklesIcon, UsersIcon, FireIcon, HeartIcon, BookmarkSquareIcon } from '../src/components/Icons';
import FeedbackWidget from '../src/components/FeedbackWidget';
import { useAiPreferences } from '../src/hooks/useAiPreferences';
import { useCouple } from '../src/contexts/CoupleContext';
import { openPassportModal } from '../src/components/PassportModal';


const DesirePath: React.FC = () => {
    const { api } = useCouple();
    const [playerPosition, setPlayerPosition] = useState(0);
    const [diceValue, setDiceValue] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState<GameChallenge | null>(null);
    const [gameMessage, setGameMessage] = useState<string | null>('¡Lanza el dado para comenzar vuestro viaje!');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasBeenRewarded, setHasBeenRewarded] = useState(false);
    const { recordFeedback } = useAiPreferences();


    const squareTypeMapping: { [key in BoardSquareType]: { color: string; icon: JSX.Element} } = useMemo(() => ({
        start: { color: 'bg-green-500', icon: <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5"/> },
        physical_challenge: { color: 'bg-red-500', icon: <FireIcon className="w-4 h-4 sm:w-5 sm:h-5"/> },
        truth_or_dare: { color: 'bg-yellow-500', icon: <span className="font-bold text-xs sm:text-sm">?</span> },
        intimate_question: { color: 'bg-purple-500', icon: <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5"/> },
        clothing_penalty: { color: 'bg-blue-500', icon: <span className="font-bold text-xs sm:text-sm">-1</span> },
        special: { color: 'bg-pink-500', icon: <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5"/> },
        finish: { color: 'bg-brand-accent', icon: <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5"/> },
    }), []);

    const handleRollDice = () => {
        if (isRolling || playerPosition >= board.length - 1) return;
        setIsRolling(true);
        setError(null);
        setGameMessage(null);
        const roll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(roll);

        setTimeout(() => {
            const newPosition = Math.min(playerPosition + roll, board.length - 1);
            setPlayerPosition(newPosition);
            setIsRolling(false);
        }, 1000);
    };
    
    const handleResetGame = () => {
        setPlayerPosition(0);
        setDiceValue(0);
        setCurrentChallenge(null);
        setGameMessage('¡Juego reiniciado! Lanza el dado para comenzar de nuevo.');
        setIsModalOpen(false);
        setHasBeenRewarded(false);
    }

    const triggerChallenge = async (type: BoardSquareType, title: string) => {
        setIsLoading(true);
        setCurrentChallenge(null);
        setGameMessage(null);
        setError(null);

        let challengeType: GameChallenge['type'] | null = null;
        switch(type) {
            case 'physical_challenge': challengeType = 'Reto Físico'; break;
            case 'truth_or_dare': challengeType = Math.random() > 0.5 ? 'Verdad' : 'Atrevimiento'; break;
            case 'intimate_question': challengeType = 'Pregunta Íntima'; break;
            case 'clothing_penalty': challengeType = 'Prenda o Reto'; break;
            case 'special':
                setGameMessage(`Casilla Especial: ${title}. ¡Inventad vuestra propia regla para esta casilla!`);
                setIsLoading(false);
                return;
            case 'finish':
                setGameMessage(`¡Felicidades, habéis llegado al clímax del juego! Como recompensa por vuestra valentía, habéis ganado una Llave de la Confianza.`);
                 if (!hasBeenRewarded) {
                    api.addKey();
                    setHasBeenRewarded(true);
                 }
                 setIsLoading(false);
                return;
        }

        if (challengeType) {
            try {
                const result = await api.generateGameChallenge({ type: challengeType });
                setCurrentChallenge(result);
                setIsModalOpen(true);
            } catch (err: any) {
                setError(err.message || "No se pudo generar el desafío.");
            }
        }
        setIsLoading(false);
    };
    
    useEffect(() => {
        if (playerPosition > 0 && playerPosition < board.length) {
            const currentSquare = board[playerPosition];
            triggerChallenge(currentSquare.type, currentSquare.title);
        }
    }, [playerPosition]);

    const handleSealMoment = () => {
      if (currentChallenge) {
          openPassportModal({
              category: 'Juego de Rol',
              title: `Desafío: ${currentChallenge.title}`,
              notes: `Completamos el desafío "${currentChallenge.title}" en el Sendero del Deseo.`
          });
          setIsModalOpen(false);
      }
    };


    return (
        <div className="max-w-6xl mx-auto text-center animate-fade-in">
            <header className="mb-8">
                <MapIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">El Sendero del Deseo</h2>
                <p className="mt-2 text-lg text-brand-muted">Un juego de tablero para explorar, conectar y encender la pasión.</p>
            </header>

            <div className="bg-brand-navy p-2 sm:p-6 rounded-xl shadow-lg border border-white/10 mb-8">
                <div className="grid grid-cols-6 gap-1 sm:gap-2">
                    {board.map((square, index) => (
                        <div key={square.id} className={`aspect-square rounded-lg flex items-center justify-center p-1 text-center relative ${squareTypeMapping[square.type].color}`}>
                             {playerPosition === index && (
                                <div className="absolute inset-0 bg-white/30 rounded-lg animate-pulse z-10 flex items-center justify-center">
                                    <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
                                </div>
                             )}
                            <div className="flex flex-col items-center">
                                {squareTypeMapping[square.type].icon}
                                <span className="text-white text-[10px] font-semibold mt-1 hidden sm:block">{square.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <button onClick={handleRollDice} disabled={isRolling || playerPosition >= board.length-1} className="bg-brand-accent text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg sm:text-xl hover:bg-pink-600 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed shadow-lg order-2 md:order-1">
                    {isRolling ? 'Lanzando...' : 'Lanzar Dado'}
                </button>
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-brand-navy rounded-lg shadow-inner text-4xl font-bold text-white order-1 md:order-2">
                    {diceValue > 0 ? diceValue : '-'}
                </div>
                 <button onClick={handleResetGame} className="text-brand-muted hover:text-white transition-colors py-2 px-4 rounded-md text-sm order-3">
                    Reiniciar Juego
                </button>
            </div>
            
             <div className="mt-6 min-h-[5rem] flex items-center justify-center p-4 bg-brand-deep-purple rounded-lg">
                {isLoading && <Loader text="Generando vuestro próximo paso..."/>}
                {error && <p className="text-red-400">{error}</p>}
                {gameMessage && <p className="text-brand-light font-serif text-lg sm:text-xl">{gameMessage}</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {currentChallenge && (
                    <>
                        <span className={`inline-block px-3 py-1 text-sm font-semibold text-white ${squareTypeMapping[board[playerPosition]?.type]?.color || 'bg-gray-500'} rounded-full mb-3`}>
                            {currentChallenge.type}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light mb-4">{currentChallenge.title}</h3>
                        <p className="text-brand-muted text-lg mb-6">{currentChallenge.description}</p>
                        
                        <div className="border-t border-brand-muted/20 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                           <button
                                onClick={handleSealMoment}
                                className="flex items-center justify-center gap-2 text-sm text-brand-accent font-semibold bg-brand-deep-purple hover:bg-brand-accent/20 py-2 px-4 rounded-md transition-colors"
                            >
                                <BookmarkSquareIcon className="w-5 h-5" />
                                Sellar este momento
                            </button>
                           <FeedbackWidget onFeedback={(feedback) => recordFeedback('challenge_type', currentChallenge.type, feedback)} contentId={currentChallenge.title} />
                        </div>

                        <button onClick={() => setIsModalOpen(false)} className="w-full bg-brand-accent hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition mt-6">
                            Continuar Juego
                        </button>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default DesirePath;
