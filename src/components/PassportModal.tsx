// src/components/PassportModal.tsx
import React, { useState } from 'react';

export interface PassportModalProps {
    onStamp: (location: string) => void;
    onClose?: () => void;
}

const PassportModal: React.FC<PassportModalProps & { onClose: () => void }> = ({ onStamp, onClose }) => {
  const [location, setLocation] = useState('');

  const handleStamp = () => {
    if (location.trim()) {
      onStamp(location.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Añadir Sello al Pasaporte</h3>
        <p className="text-gray-600 mb-4">¿Dónde habéis hecho el amor? Añade una nueva ubicación a vuestro pasaporte íntimo.</p>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: La playa de noche"
          className="w-full px-3 py-2 border rounded mb-6"
        />
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleStamp} className="px-4 py-2 rounded text-white bg-pink-500 hover:bg-pink-600">
            Sellar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassportModal;