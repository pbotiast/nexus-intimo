

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Un componente de modal reutilizable que muestra contenido superpuesto.
 * Para una accesibilidad completa, el contenido del modal (`children`) debe incluir
 * un elemento con un `id` que pueda ser referenciado por `aria-labelledby`.
 * @param {boolean} isOpen - Controla si el modal está visible.
 * @param {() => void} onClose - Función que se llama cuando el usuario intenta cerrar el modal.
 * @param {React.ReactNode} children - El contenido a mostrar dentro del modal.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-brand-navy w-full max-w-2xl rounded-xl shadow-2xl p-6 border border-brand-accent/30"
        onClick={e => e.stopPropagation()} // Prevent click inside from closing
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;