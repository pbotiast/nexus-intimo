// src/views/PairingPage.tsx - NUEVO ARCHIVO

import React, { useState } from 'react';
import { generateInvitation, acceptInvitation } from '../services/api';
import { useAuth } from '../App.tsx'; // Importa desde App.tsx o donde definas el contexto

const PairingPage: React.FC = () => {
    const { setCoupleId } = useAuth(); // Para actualizar el estado global cuando se emparejen
    const [invitationCode, setInvitationCode] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateInvite = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await generateInvitation();
            setInvitationCode(data.invitationCode);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAcceptInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const data = await acceptInvitation(joinCode);
            alert(data.message); // O una notificación más elegante
            setCoupleId(data.coupleId); // ¡Actualiza el estado global para que la app sepa que ya están en pareja!
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-brand-deep-purple">
            <h1 className="text-4xl font-serif text-brand-light mb-4">Conecta con tu Pareja</h1>
            <p className="text-brand-muted max-w-lg mb-10">
                Para empezar a usar las funciones compartidas, un miembro debe generar un código de invitación y el otro debe aceptarlo.
            </p>

            <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna para Crear Invitación */}
                <div className="bg-brand-navy p-6 rounded-xl flex flex-col items-center">
                    <h2 className="text-2xl font-serif text-brand-accent mb-4">Paso 1: Generar Código</h2>
                    <button 
                        onClick={handleGenerateInvite} 
                        disabled={isLoading}
                        className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg transition hover:bg-pink-600 disabled:bg-gray-500"
                    >
                        {isLoading ? 'Generando...' : 'Generar mi Código'}
                    </button>
                    {invitationCode && (
                        <div className="mt-4 bg-brand-deep-purple p-4 rounded-lg w-full">
                            <p className="text-brand-muted text-sm">Comparte este código:</p>
                            <p className="text-3xl font-mono text-white tracking-widest">{invitationCode}</p>
                        </div>
                    )}
                </div>

                {/* Columna para Aceptar Invitación */}
                <div className="bg-brand-navy p-6 rounded-xl flex flex-col items-center">
                    <h2 className="text-2xl font-serif text-brand-accent mb-4">Paso 2: Unirse</h2>
                    <form onSubmit={handleAcceptInvite} className="w-full flex flex-col gap-3">
                        <input 
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO"
                            className="bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-3 text-center text-xl font-mono text-white"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !joinCode}
                            className="bg-brand-accent text-white font-bold py-2 px-6 rounded-lg transition hover:bg-pink-600 disabled:bg-gray-500"
                        >
                            {isLoading ? 'Uniéndose...' : 'Unirme a mi Pareja'}
                        </button>
                    </form>
                </div>
            </div>
             {error && <p className="mt-8 text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        </div>
    );
};

export default PairingPage;