// src/views/Mastery.tsx

import React, { useState, useMemo } from 'react';
import { usePassport } from '../contexts/PassportContext';
import { useModal } from '../contexts/ModalContext'; // Importar el hook de modal
import { sexualPositions } from '../../data/positions';
import type { SexualPosition } from '../types';

// CORRECCIÓN: Los tipos de filtro deben coincidir con los tipos de postura definidos
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
                    // id: Date.now().toString(), // No se requiere id aquí, PassportContext lo genera
                    category: 'Postura Nueva', // Añadir categoría explícitamente
                    title: positionName, // Usar el nombre de la posición como título
                    notes: `Probamos la postura: ${positionName}. Añadida desde Maestría Íntima.`,
                });
            },
        });
    };

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl font-bold mb-4 text-orange-400">Maestría Íntima</h1>
            <p className="mb-6 text-gray-300">Explorad el Kamasutra y otras artes amatorias. Descubrid nuevas posturas y añadidlas a vuestra colección de experiencias.</p>

            <div className="mb-6">
                {/* CORRECCIÓN: Filtros deben coincidir con los tipos de SexualPosition */}
                <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-orange-600' : 'bg-gray-700'}`}>Todas</button>
                    <button onClick={() => setFilter('Intimidad')} className={`px-4 py-2 rounded ${filter === 'Intimidad' ? 'bg-orange-600' : 'bg-gray-700'}`}>Intimidad</button>
                    <button onClick={() => setFilter('Placer Clitoriano')} className={`px-4 py-2 rounded ${filter === 'Placer Clitoriano' ? 'bg-orange-600' : 'bg-gray-700'}`}>Placer Clitoriano</button>
                    <button onClick={() => setFilter('Placer Vaginal')} className={`px-4 py-2 rounded ${filter === 'Placer Vaginal' ? 'bg-orange-600' : 'bg-gray-700'}`}>Placer Vaginal</button>
                    <button onClick={() => setFilter('Acrobático')} className={`px-4 py-2 rounded ${filter === 'Acrobático' ? 'bg-orange-600' : 'bg-gray-700'}`}>Acrobático</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPositions.map(pos => (
                    <div key={pos.name} onClick={() => setSelectedPosition(pos)} className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                        {/* CORRECCIÓN: Usar pos.imageUrl */}
                        <img src={pos.imageUrl} alt={pos.name} className="w-full h-32 object-cover rounded-md mb-2" />
                        <h3 className="font-bold text-center">{pos.name}</h3>
                    </div>
                ))}
            </div>

            {selectedPosition && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={() => setSelectedPosition(null)}>
                    <div className="bg-gray-900 p-6 rounded-lg max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-orange-400">{selectedPosition.name}</h2>
                        {/* CORRECCIÓN: Usar pos.imageUrl */}
                        <img src={selectedPosition.imageUrl} alt={selectedPosition.name} className="w-full h-64 object-contain rounded-md my-4" />
                        {/* Eliminado dificultad ya que no está en el tipo SexualPosition */}
                        <p className="text-gray-300 mb-2"><span className="font-bold">Tipo:</span> {selectedPosition.type}</p>
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