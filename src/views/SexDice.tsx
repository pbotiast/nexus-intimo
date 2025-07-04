// src/views/SexDice.tsx

import React, { useState } from 'react';
import { useModal } from '../contexts/ModalContext'; // Importar hook
import { CubeIcon } from '../components/Icons'; // Asumiendo un icono

const actions = ['Besa', 'Acaricia', 'Lame', 'Masajea', 'Muerde suavemente', 'Succiona', 'Explora con la lengua', 'Toca con ternura', 'Frota', 'Estimula con pasión'];
const bodyParts = ['el pene', 'la vagina', 'el cuello', 'los pezones', 'los pechos', 'la boca'];

const SexDice: React.FC = () => {
    const { showModal } = useModal(); // Usar hook
    const [result, setResult] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    const rollDice = () => {
        setIsRolling(true);
        setTimeout(() => {
            const action = actions[Math.floor(Math.random() * actions.length)];
            const part = bodyParts[Math.floor(Math.random() * bodyParts.length)];
            setResult(`${action} ${part}`);
            setIsRolling(false);
        }, 1000); // Simula la tirada
    };

    const showInstructions = () => {
        showModal('confirm', {
            title: 'Instrucciones de los Dados',
            message: 'Tira los dados para obtener una combinación de una acción y una parte del cuerpo. ¡Dejaos llevar por el resultado y disfrutad del momento!',
            onConfirm: () => {}, // No necesita acción, solo es informativo
        });
    };

    return (
        <div className="p-4 text-center text-white">
            <h1 className="text-3xl font-bold mb-4 text-purple-400">Dados Sexuales</h1>
            <p className="mb-6 text-gray-300">Dejad que el azar encienda la chispa. Lanzad los dados y ved qué aventura os espera.</p>

            <div className="my-10">
                <button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg text-2xl hover:bg-purple-700 transition-transform transform active:scale-95 disabled:opacity-50"
                >
                    {isRolling ? 'Lanzando...' : 'Lanzar Dados'}
                </button>
            </div>

            {result && !isRolling && (
                <div className="p-6 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
                    <p className="text-2xl font-bold text-purple-300">{result}</p>
                </div>
            )}

            <div className="mt-10">
                <button onClick={showInstructions} className="text-sm text-gray-400 hover:underline">
                    ¿Cómo se juega?
                </button>
            </div>
        </div>
    );
};

export default SexDice;