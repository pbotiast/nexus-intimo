// src/pages/BodyMapPage.tsx
import React, { useState } from 'react';
import { useCouple } from '../contexts/CoupleContext';
import Loader from '../components/Loader';

const BodyMapPage: React.FC = () => {
  const { coupleData, saveData } = useCouple();
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

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Mapa Corporal</h1>
      <p className="mb-4">Haz clic en una parte del cuerpo para dejar una marca o un mensaje.</p>
      {isSaving && <Loader message="Guardando marca..." />}

      {/* Aquí iría tu componente visual del cuerpo humano */}
      <div className="relative w-64 h-96 bg-gray-200 mx-auto mb-4 rounded-lg">
          {/* Ejemplo de una parte del cuerpo clickeable */}
          <div 
            className="absolute top-10 left-20 w-10 h-10 bg-red-300 rounded-full cursor-pointer hover:bg-red-400"
            onClick={() => setSelectedPart('corazon')}
          >
            {coupleData?.bodyMap?.['corazon'] && '❤️'}
          </div>
          <div 
            className="absolute top-20 left-10 w-8 h-8 bg-blue-300 rounded-full cursor-pointer hover:bg-blue-400"
            onClick={() => setSelectedPart('hombro_izq')}
          >
             {coupleData?.bodyMap?.['hombro_izq'] && '✨'}
          </div>
      </div>

      {selectedPart && (
        <div className="mt-4 p-4 bg-white rounded shadow-lg">
          <h3 className="font-bold">Dejar una marca en: {selectedPart}</h3>
          <p className="text-sm text-gray-500 mb-2">
            Marca actual: {coupleData?.bodyMap?.[selectedPart] || 'Ninguna'}
          </p>
          <input
            type="text"
            value={mark}
            onChange={(e) => setMark(e.target.value)}
            placeholder="Ej: 'Me encanta este lugar' o un emoji"
            className="w-full p-2 border rounded"
            disabled={isSaving}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setSelectedPart(null)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button onClick={handleSaveMark} className="px-4 py-2 bg-pink-500 text-white rounded" disabled={isSaving}>
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMapPage;