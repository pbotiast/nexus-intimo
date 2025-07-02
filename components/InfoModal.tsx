import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface InfoModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

const InfoModal: React.FC = () => {
    const [state, setState] = useState<InfoModalState>({ isOpen: false, title: '', message: '' });

    useEffect(() => {
        const handler = (e: CustomEvent<{ title: string; message: string }>) => {
            setState({ isOpen: true, title: e.detail.title, message: e.detail.message });
        };
        document.addEventListener('showInfoModal', handler as EventListener);
        return () => document.removeEventListener('showInfoModal', handler as EventListener);
    }, []);
    
    const handleClose = () => {
        setState({ ...state, isOpen: false });
    };

    return (
        <Modal isOpen={state.isOpen} onClose={handleClose}>
            <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-brand-light mb-4">{state.title}</h3>
                <p className="text-brand-muted mb-6">{state.message}</p>
                <div className="flex justify-center">
                    <button onClick={handleClose} className="bg-brand-accent hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-lg transition">Entendido</button>
                </div>
            </div>
        </Modal>
    );
};

export const showInfoModal = (title: string, message: string) => {
    document.dispatchEvent(new CustomEvent('showInfoModal', { detail: { title, message } }));
};

export default InfoModal;
