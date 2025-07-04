// src/views/StoryWeaver.tsx

import React, { useState } from 'react';
import { useEmpathyEngine } from '../contexts/EmpathyEngineContext';
import Loader from '../components/Loader';
import { BookmarkSquareIcon } from '../components/Icons';
import { useCouple } from '../contexts/CoupleContext';
import { useModal } from '../contexts/ModalContext'; // Importar el hook de modal
import { usePassport } from '../contexts/PassportContext'; // Importar el hook de pasaporte

const StoryWeaver: React.FC = () => {
    const { generateStory, isLoading } = useEmpathyEngine();
    const { coupleData } = useCouple();
    const { showModal } = useModal(); // Usar el hook
    const { addStamp } = usePassport(); // Usar el hook

    const [story, setStory] = useState<string>('');
    const [prompt, setPrompt] = useState('');
    const [mood, setMood] = useState('romántico');
    const [style, setStyle] = useState('poético');

    const handleGenerateStory = async () => {
        const generated = await generateStory(prompt, mood, style);
        if (generated) {
            setStory(generated);
        }
    };

    // Función actualizada para usar el nuevo sistema de modales
    const handleOpenPassportModal = () => {
        showModal('passport', {
            onStamp: (location: string) => {
                addStamp({
                    id: Date.now().toString(),
                    location,
                    date: new Date().toISOString(),
                    notes: `Inspirado por una historia tejida juntos.`,
                });
            },
        });
    };

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl font-bold mb-4 text-teal-400">Tejedor de Historias</h1>
            <p className="mb-6 text-gray-300">Cread juntos narrativas eróticas y románticas. Dadle a la IA una idea y ved qué magia puede crear para vosotros.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label htmlFor="mood" className="block text-sm font-medium text-gray-400 mb-1">Tono</label>
                    <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full p-2 bg-gray-800 border-gray-700 rounded-md">
                        <option value="romántico">Romántico</option>
                        <option value="apasionado">Apasionado</option>
                        <option value="juguetón">Juguetón</option>
                        <option value="sensual">Sensual</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="style" className="block text-sm font-medium text-gray-400 mb-1">Estilo</label>
                    <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full p-2 bg-gray-800 border-gray-700 rounded-md">
                        <option value="poético">Poético</option>
                        <option value="descriptivo">Descriptivo</option>
                        <option value="directo">Directo</option>
                    </select>
                </div>
                <div className="md:col-span-3">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-1">Vuestra Idea</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej: Un reencuentro inesperado en una noche de lluvia..."
                        className="w-full p-2 bg-gray-800 border-gray-700 rounded-md h-24"
                    />
                </div>
            </div>

            <button
                onClick={handleGenerateStory}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
                {isLoading ? 'Tejiendo...' : 'Crear Historia'}
            </button>

            {isLoading && <Loader message="La IA está creando vuestra historia, un momento..." />}

            {story && (
                <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-teal-400">Vuestra Creación</h2>
                    <p className="whitespace-pre-wrap text-gray-300">{story}</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={handleOpenPassportModal} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                            <BookmarkSquareIcon />
                            Sellar Pasaporte
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryWeaver;