import React, { useState } from 'react';
import { useCouple } from '../contexts/CoupleContext';
import { SparklesIcon } from './Icons';
import Loader from './Loader';

interface PairingModalProps {
    error: string | null;
}

const PairingModal: React.FC<PairingModalProps> = ({ error: initialError }) => {
    const { createCoupleSession, joinCoupleSession, pairingCode, isLoading } = useCouple();
    const [joinCode, setJoinCode] = useState('');
    const [view, setView] = useState<'start' | 'create' | 'join'>('start');
    const [joinError, setJoinError] = useState<string | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError(null);
        try {
            await joinCoupleSession(joinCode);
        } catch (err: any) {
            setJoinError(err.message || "Error al unirse a la sesión.");
        }
    };

    const renderStartView = () => (
        <>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-light mb-4">Conecta con tu Pareja</h2>
            <p className="text-brand-muted mb-8">Para empezar, un miembro de la pareja debe crear una sesión y compartir el código con el otro.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => { createCoupleSession(); setView('create'); }} className="flex-1 bg-brand-accent text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                    Crear Nueva Sesión
                </button>
                <button onClick={() => setView('join')} className="flex-1 bg-brand-navy border border-brand-accent text-brand-accent font-bold py-3 px-6 rounded-lg transition-colors hover:bg-brand-accent/10">
                    Unirse con un Código
                </button>
            </div>
        </>
    );

    const renderCreateView = () => (
        <>
            <h2 className="text-2xl font-serif text-brand-light mb-4">Comparte este Código</h2>
            <p className="text-brand-muted mb-6">Tu pareja debe introducir este código para unirse a vuestra sesión compartida. El código expira en 5 minutos.</p>
            {isLoading && !pairingCode && <Loader text="Generando código..." />}
            {pairingCode && (
                <div className="bg-brand-deep-purple p-6 rounded-lg border border-dashed border-brand-accent">
                    <p className="text-5xl font-mono font-bold text-white tracking-widest">{pairingCode}</p>
                </div>
            )}
            <p className="text-brand-muted mt-6 text-sm">Esperando a que tu pareja se conecte...</p>
            <button onClick={() => setView('start')} className="text-brand-muted hover:text-white mt-4 text-xs">Volver</button>
        </>
    );

    const renderJoinView = () => (
        <>
            <h2 className="text-2xl font-serif text-brand-light mb-4">Unirse a una Sesión</h2>
            <p className="text-brand-muted mb-6">Introduce el código que tu pareja te ha compartido.</p>
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABCDEF"
                    maxLength={6}
                    className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-4 text-center text-3xl font-mono tracking-widest text-white focus:ring-2 focus:ring-brand-accent"
                />
                <button type="submit" disabled={isLoading || joinCode.length < 6} className="bg-brand-accent text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600">
                    {isLoading ? 'Conectando...' : 'Unirse'}
                </button>
            </form>
            {(joinError || initialError) && <p className="text-red-400 mt-4">{joinError || initialError}</p>}
            <button onClick={() => setView('start')} className="text-brand-muted hover:text-white mt-4 text-xs">Volver</button>
        </>
    );
    
    return (
         <div className="fixed inset-0 bg-brand-deep-purple z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center bg-brand-navy p-8 rounded-2xl shadow-2xl border border-brand-accent/20">
                <SparklesIcon className="w-12 h-12 text-brand-accent mx-auto mb-4" />
                {view === 'start' && renderStartView()}
                {view === 'create' && renderCreateView()}
                {view === 'join' && renderJoinView()}
            </div>
         </div>
    );
};

export default PairingModal;
