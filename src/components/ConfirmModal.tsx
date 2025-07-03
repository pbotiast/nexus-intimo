import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

const ConfirmModal: React.FC = () => {
    const [state, setState] = useState<ConfirmModalState>({ isOpen: false, title: '', message: '' });
    const onConfirmRef = useRef<() => void>(() => {});

    useEffect(() => {
        const handler = (e: CustomEvent<{ title: string; message: string; onConfirm: () => void }>) => {
            onConfirmRef.current = e.detail.onConfirm;
            setState({ isOpen: true, title: e.detail.title, message: e.detail.message });
        };
        document.addEventListener('showConfirmModal', handler as EventListener);
        return () => document.removeEventListener('showConfirmModal', handler as EventListener);
    }, []);
    
    const handleClose = () => {
        setState({ ...state, isOpen: false });
    };
    
    const handleConfirm = () => {
        onConfirmRef.current();
        handleClose();
    };

    return (
        <Modal isOpen={state.isOpen} onClose={handleClose}>
             <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-brand-light mb-4">{state.title}</h3>
                <p className="text-brand-muted mb-6">{state.message}</p>
                <div className="flex justify-center gap-4">
                     <button onClick={handleClose} className="bg-brand-navy hover:bg-brand-deep-purple text-brand-light font-bold py-2 px-6 rounded-lg transition border border-brand-muted/50">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">Confirmar</button>
                </div>
            </div>
        </Modal>
    );
};

export const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    document.dispatchEvent(new CustomEvent('showConfirmModal', { detail: { title, message, onConfirm } }));
};

export default ConfirmModal;
