// src/views/BodyMap.tsx

import React, { useState } from 'react';
import { useCouple } from '../contexts/CoupleContext';
import { useModal } from '../contexts/ModalContext'; // Importar hook
import Loader from '../components/Loader';
import { HeartIcon, SparklesIcon } from '../components/Icons'; // Asumiendo que tienes iconos

const BodyMap: React.FC = () => {
    const { coupleData, saveData } = useCouple();
    const { showModal } = useModal(); // Usar hook
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [mark, setMark] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveMark = async () => {
        if (!selectedPart || !mark.trim()) return;
        setIsSaving(true);
        const currentBodyMap = coupleData?.bodyMap || {};
        await saveData({
            bodyMap: {
                ...currentBodyMap,
                [selectedPart]: mark.trim()
            }
        });
        setSelectedPart(null);
        setMark('');
        setIsSaving(false);
    };

    const handleSelectPart = (part: string) => {
        setSelectedPart(part);
        setMark(coupleData?.bodyMap?.[part] || ''); // Precargar la marca existente
    };

    return (
        <div className="p-4 text-center text-white">
            <h1 className="text-3xl font-bold mb-4 text-rose-400">Mapa Corporal</h1>
            <p className="mb-6 text-gray-300">Explorad vuestros cuerpos. Dejad una marca, un emoji o un mensaje en cada zona para vuestra pareja.</p>
            {isSaving && <Loader message="Guardando marca..." />}

            {/* Placeholder para la representación visual del cuerpo */}
            <div className="relative w-64 h-96 bg-gray-800 mx-auto mb-4 rounded-lg border-2 border-gray-700">
                <div
                    className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center bg-rose-500/30 rounded-full cursor-pointer hover:bg-rose-500/50"
                    onClick={() => handleSelectPart('corazon')}
                >
                    {coupleData?.bodyMap?.['corazon'] ? '❤️' : <HeartIcon />}
                </div>
                <div
                    className="absolute top-32 left-8 w-10 h-10 flex items-center justify-center bg-sky-500/30 rounded-full cursor-pointer hover:bg-sky-500/50"
                    onClick={() => handleSelectPart('hombro_izquierdo')}
                >
                    {coupleData?.bodyMap?.['hombro_izquierdo'] ? '✨' : <SparklesIcon />}
                </div>
                 {/* Añadir más partes del cuerpo aquí */}
            </div>

            {selectedPart && (
                <div className="mt-4 p-4 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="font-bold text-lg">Dejar una marca en: <span className="text-rose-400">{selectedPart}</span></h3>
                    <input
                        type="text"
                        value={mark}
                        onChange={(e) => setMark(e.target.value)}
                        placeholder="Ej: 'Me encanta este lugar' o un emoji"
                        className="w-full p-2 mt-2 bg-gray-900 border border-gray-600 rounded"
                        disabled={isSaving}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setSelectedPart(null)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancelar</button>
                        <button onClick={handleSaveMark} className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700" disabled={isSaving}>
                            Guardar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BodyMap;