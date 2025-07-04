// src/views/PassionPassport.tsx

import React from 'react';
import { usePassport, Achievement } from '../contexts/PassportContext';
import { useModal } from '../contexts/ModalContext'; // Importar el hook de modal
import { LocationMarkerIcon, CheckCircleIcon, LockClosedIcon } from '../components/Icons';

// Definimos los logros fuera del componente si no dependen de props o estado
const allAchievements: Omit<Achievement, 'isUnlocked'>[] = [
    { id: 'first_stamp', name: 'Primer Sello', description: 'Añade vuestra primera ubicación al pasaporte.' },
    { id: 'three_stamps', name: 'Trotamundos Íntimos', description: 'Colecciona 3 sellos en vuestro pasaporte.' },
    { id: 'five_stamps', name: 'Exploradores Apasionados', description: 'Alcanza los 5 sellos. ¡Vuestra aventura no tiene límites!' },
    { id: 'ten_stamps', name: 'Conquistadores del Placer', description: 'Consigue 10 sellos. ¡Sois una leyenda!' },
    // Añade más logros aquí
];

const PassionPassport: React.FC = () => {
    const { stamps, addStamp, removeStamp, achievements } = usePassport();
    const { showModal } = useModal(); // Usar el hook para acceder a los modales

    const handleAddStamp = (location: string) => {
        addStamp({
            id: Date.now().toString(),
            location,
            date: new Date().toISOString(),
            notes: '',
        });
    };

    const handleRemoveStamp = (stampId: string) => {
        showModal('confirm', {
            title: 'Eliminar Sello',
            message: '¿Estás seguro de que quieres borrar este recuerdo de vuestro pasaporte?',
            onConfirm: () => removeStamp(stampId),
        });
    };

    const handleOpenPassportModal = () => {
        showModal('passport', {
            onStamp: handleAddStamp,
        });
    };
    
    // Calcula qué logros están desbloqueados
    const unlockedAchievements = allAchievements.map(ach => ({
        ...ach,
        isUnlocked: achievements.some(unlocked => unlocked.id === ach.id)
    }));

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl font-bold mb-4 text-amber-400">Pasaporte de Pasión</h1>
            <p className="mb-6 text-gray-300">Cada lugar donde habéis compartido intimidad es un sello en vuestro viaje. Coleccionad vuestros recuerdos.</p>

            <button
                onClick={handleOpenPassportModal}
                className="w-full mb-8 px-6 py-3 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors"
            >
                Añadir Nuevo Sello
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna de Sellos */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 border-b-2 border-amber-500 pb-2">Vuestros Sellos</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {stamps.map((stamp) => (
                            <div key={stamp.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-amber-300">{stamp.location}</p>
                                    <p className="text-sm text-gray-400">{new Date(stamp.date).toLocaleDateString()}</p>
                                    {stamp.notes && <p className="text-sm mt-1 italic text-gray-300">"{stamp.notes}"</p>}
                                </div>
                                <button onClick={() => handleRemoveStamp(stamp.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                    &#x2716;
                                </button>
                            </div>
                        ))}
                        {stamps.length === 0 && (
                             <p className="text-gray-400">Aún no tenéis sellos. ¡Añadid el primero!</p>
                        )}
                    </div>
                </div>

                {/* Columna de Logros */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 border-b-2 border-amber-500 pb-2">Logros</h2>
                    <div className="space-y-4">
                        {unlockedAchievements.map(ach => (
                            <div key={ach.id} className={`p-4 rounded-lg flex items-center gap-4 ${ach.isUnlocked ? 'bg-green-900/50' : 'bg-gray-800'}`}>
                                <div className={`p-2 rounded-full ${ach.isUnlocked ? 'bg-green-500' : 'bg-gray-600'}`}>
                                    {ach.isUnlocked ? <CheckCircleIcon /> : <LockClosedIcon />}
                                </div>
                                <div>
                                    <p className={`font-bold ${ach.isUnlocked ? 'text-white' : 'text-gray-400'}`}>{ach.name}</p>
                                    <p className="text-sm text-gray-400">{ach.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PassionPassport;