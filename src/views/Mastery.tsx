// src/views/Mastery.tsx

import React, { useState, useMemo } from 'react';
import { usePassport } from '../contexts/PassportContext';
import { useModal } from '../contexts/ModalContext'; // Importar el hook de modal
import { sexualPositions } from '../../data/positions';
import type { SexualPosition } from '../types';

type FilterType = 'all' | SexualPosition['type'];

const Mastery: React.FC = () => {
    const { addStamp } = usePassport();
    const { showModal } = useModal(); // Usar el hook
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedPosition, setSelectedPosition] = useState<SexualPosition | null>(null);

    const filteredPositions = useMemo(() => {
        if (filter === 'all') {
            return sexualPositions;
        }
        return sexualPositions.filter(p => p.type === filter);
    }, [filter]);

    const handleTryPosition = (positionName: string) => {
        showModal('passport', {
            onStamp: (location: string) => {
                addStamp({
                    id: Date.now().toString(),
                    location,
                    date: new Date().toISOString(),
                    notes: `Probamos la postura: ${positionName}.`,
                });
            },
        });
    };

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl font-bold mb-4 text-orange-400">Maestría Íntima</h1>
            <p className="mb-6 text-gray-300">Explorad el Kamasutra y otras artes amatorias. Descubrid nuevas posturas y añadidlas a vuestra colección de experiencias.</p>

            <div className="mb-6">
                {/* Filtros */}
                <div className="flex space-x-2">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-orange-600' : 'bg-gray-700'}`}>Todas</button>
                    <button onClick={() => setFilter('penetration')} className={`px-4 py-2 rounded ${filter === 'penetration' ? 'bg-orange-600' : 'bg-gray-700'}`}>Penetración</button>
                    <button onClick={() => setFilter('oral')} className={`px-4 py-2 rounded ${filter === 'oral' ? 'bg-orange-600' : 'bg-gray-700'}`}>Oral</button>
                    <button onClick={() => setFilter('manual')} className={`px-4 py-2 rounded ${filter === 'manual' ? 'bg-orange-600' : 'bg-gray-700'}`}>Manual</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPositions.map(pos => (
                    <div key={pos.name} onClick={() => setSelectedPosition(pos)} className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                        <img src={pos.image} alt={pos.name} className="w-full h-32 object-cover rounded-md mb-2" />
                        <h3 className="font-bold text-center">{pos.name}</h3>
                    </div>
                ))}
            </div>

            {selectedPosition && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={() => setSelectedPosition(null)}>
                    <div className="bg-gray-900 p-6 rounded-lg max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-orange-400">{selectedPosition.name}</h2>
                        <img src={selectedPosition.image} alt={selectedPosition.name} className="w-full h-64 object-contain rounded-md my-4" />
                        <p className="text-gray-300 mb-2"><span className="font-bold">Dificultad:</span> {selectedPosition.difficulty}</p>
                        <p className="text-gray-300">{selectedPosition.description}</p>
                        <button
                            onClick={() => handleTryPosition(selectedPosition.name)}
                            className="mt-6 w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700"
                        >
                            ¡La hemos probado! (Sellar Pasaporte)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mastery;