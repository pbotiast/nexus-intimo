// src/components/ConfirmModal.tsx
import React from 'react';

export interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose?: () => void; // onClose es manejado por el context, pero lo mantenemos por si se usa directamente
}

const ConfirmModal: React.FC<ConfirmModalProps & { onClose: () => void }> = ({ title, message, onConfirm, onClose }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;