// src/views/TandemJournal.tsx

import React, { useState } from 'react';
import { useCouple } from '../contexts/CoupleContext';
import { useModal } from '../contexts/ModalContext'; // Importar hook
import Loader from '../components/Loader';

const journalPrompts = [
    "¿Qué es lo que más admiras de mí hoy?",
    "Describe un recuerdo feliz que tengamos juntos.",
    "¿Cuál es un sueño que te gustaría que cumpliéramos juntos?",
    "¿Cómo puedo hacerte sentir más amado/a esta semana?",
    "¿Que te gustaria que hiciesemos hoy antes de que acabe el día?",
    "¿Qué es lo que más te gusta de nuestra relación?",
    "¿Cómo te sientes acerca de nuestro futuro juntos?",
    "¿Qué es lo que más te emociona de nuestra relación?",
    "¿Qué es lo que más te gusta de pasar tiempo conmigo?",
    "¿Coimo podemos mejorar nuestra comunicación?",
    "¿Qué es lo que más te gusta de nuestra intimidad?",
    "¿Qué es lo que más te gusta de nuestra conexión emocional?",
    "¿Qué es lo que más te gusta de nuestra conexión física?",
    "¿Qué te gustaria probar nuevo en el sexo conmigo?",

]



const TandemJournal: React.FC = () => {
    const { coupleData, saveData } = useCouple();
    const { showModal } = useModal(); // Usar hook
    const [entry, setEntry] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveEntry = async () => {
        if (!entry.trim()) return;

        showModal('confirm', {
            title: 'Guardar Entrada',
            message: '¿Estás seguro de que quieres añadir esta entrada a vuestro diario compartido?',
            onConfirm: async () => {
                setIsSaving(true);
                const currentJournal = (coupleData as any)?.journal || [];
                const newEntry = { text: entry, date: new Date().toISOString(), author: 'user' }; // 'user' es un placeholder
                await saveData({ journal: [...currentJournal, newEntry] });
                setEntry('');
                setIsSaving(false);
            },
        });
    };

    const getRandomPrompt = () => {
        const prompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
        setEntry(prompt + '\n\n');
    };

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl font-bold mb-4 text-cyan-400">Diario Tándem</h1>
            <p className="mb-6 text-gray-300">Un espacio para vuestros pensamientos, sueños y reflexiones compartidas.</p>
            {isSaving && <Loader message="Guardando en vuestro diario..." />}

            <div className="mb-4">
                 <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Escribe aquí vuestros pensamientos..."
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md h-40"
                    disabled={isSaving}
                />
            </div>
            <div className="flex gap-4">
                 <button onClick={handleSaveEntry} className="px-6 py-2 bg-cyan-600 rounded hover:bg-cyan-700" disabled={isSaving}>Guardar Entrada</button>
                 <button onClick={getRandomPrompt} className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-500">Sugerencia</button>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Vuestras Entradas</h2>
                <div className="space-y-4">
                    {((coupleData as any)?.journal || []).map((item: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-800 rounded-lg">
                            <p className="whitespace-pre-wrap">{item.text}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(item.date).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TandemJournal;