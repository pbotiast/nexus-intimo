// src/pages/DesiresPage.tsx
import React, { useState } from 'react';
import { useCouple } from '../contexts/CoupleContext';
import { useModal } from '../contexts/ModalContext'; // Importar
import Loader from '../components/Loader';

const DesiresPage: React.FC = () => {
  const { coupleData, saveData } = useCouple();
  const { showModal } = useModal(); // Usar hook
  const [newDesire, setNewDesire] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddDesire = async () => {
    if (!newDesire.trim()) return;
    setIsSaving(true);
    const currentDesires = coupleData?.desires || [];
    await saveData({ desires: [...currentDesires, newDesire.trim()] });
    setNewDesire('');
    setIsSaving(false);
  };

  const handleRemoveDesire = (desireToRemove: string) => {
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
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Deseos</h1>
      {isSaving && <Loader message="Guardando cambios..." />}
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newDesire}
          onChange={(e) => setNewDesire(e.target.value)}
          placeholder="Añade un nuevo deseo..."
          className="flex-grow p-2 border rounded"
          disabled={isSaving}
        />
        <button onClick={handleAddDesire} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={isSaving}>
          Añadir
        </button>
      </div>

      <ul className="space-y-2">
        {coupleData?.desires?.map((desire, index) => (
          <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span>{desire}</span>
            <button onClick={() => handleRemoveDesire(desire)} className="text-red-500">
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DesiresPage;