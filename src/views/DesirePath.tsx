// src/views/DesirePath.tsx

import React, { useState } from 'react';
import { useCouple } from '../contexts/CoupleContext';
import { useModal } from '../contexts/ModalContext'; // Import the useModal hook
import { usePassport } from '../contexts/PassportContext'; // To handle passport logic
import Loader from '../components/Loader';

const DesirePath: React.FC = () => {
    const { coupleData, saveData } = useCouple();
    const { addStamp } = usePassport();
    const { showModal } = useModal(); // Use the hook to get the showModal function
    const [newDesire, setNewDesire] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddDesire = async () => {
        if (!newDesire.trim()) return;
        setIsSaving(true);
        const currentDesires = coupleData?.desires || [];
        // The saveData function will handle the API call and SSE update
        await saveData({ desires: [...currentDesires, newDesire.trim()] });
        setNewDesire('');
        setIsSaving(false);
    };

    const handleRemoveDesire = (desireToRemove: string) => {
        // Use the modal hook to show a confirmation dialog
        showModal('confirm', {
            title: 'Confirmar Eliminación',
            message: `¿Estás seguro de que quieres eliminar el deseo "${desireToRemove}"?`,
            onConfirm: async () => {
                setIsSaving(true);
                const currentDesires = coupleData?.desires || [];
                await saveData({ desires: currentDesires.filter(d => d !== desireToRemove) });
                setIsSaving(false);
            },
        });
    };
    
    // This function now uses the new modal system
    const handleOpenPassportModal = () => {
        showModal('passport', {
            onStamp: (location: string) => {
                addStamp({
                    id: Date.now().toString(),
                    location,
                    date: new Date().toISOString(),
                    notes: `Sello añadido desde la lista de deseos.`,
                });
            },
        });
    };

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl font-bold mb-4 text-pink-400">Camino del Deseo</h1>
            <p className="mb-6 text-gray-300">Un espacio para compartir vuestros anhelos y fantasías. Cada deseo añadido es un paso más en vuestro viaje íntimo.</p>
            
            {isSaving && <Loader message="Guardando cambios..." />}

            <div className="mb-6 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={newDesire}
                    onChange={(e) => setNewDesire(e.target.value)}
                    placeholder="Susurra un nuevo deseo..."
                    className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={isSaving}
                />
                <button 
                    onClick={handleAddDesire} 
                    className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50" 
                    disabled={isSaving}
                >
                    Añadir
                </button>
            </div>

            <div className="space-y-3">
                {coupleData?.desires?.map((desire, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-800 rounded-lg shadow-md">
                        <span className="text-lg">{desire}</span>
                        <button onClick={() => handleRemoveDesire(desire)} className="text-gray-400 hover:text-red-500 transition-colors">
                            &#x2716; {/* Esto es una X (cruz) */}
                        </button>
                    </div>
                ))}
            </div>

            {/* Botón para abrir el pasaporte, ahora usando la nueva función */}
            <div className="mt-8 text-center">
                 <button 
                    onClick={handleOpenPassportModal} 
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Sellar Pasaporte
                </button>
            </div>
        </div>
    );
};

export default DesirePath;