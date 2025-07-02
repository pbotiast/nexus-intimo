import React, { useState, useEffect } from 'react';
import type { StampData, StampCategory } from '../types';
import Modal from './Modal';
import { useCouple } from '../contexts/CoupleContext';

const stampCategories: StampCategory[] = [
    'Postura Nueva',
    'Fantasía Cumplida',
    'Juego de Rol',
    'Lugar Inusual',
    'Cita Memorable',
    'Logro Personal'
];

interface PassportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: StampData | null;
}

const PassportModalComponent: React.FC<PassportModalProps> = ({ isOpen, onClose, initialData }) => {
    const { api } = useCouple();
    const [stampDetails, setStampDetails] = useState<StampData>({});

    useEffect(() => {
        if (initialData) {
            setStampDetails(initialData);
        } else {
            setStampDetails({ category: 'Cita Memorable', title: '', notes: '' });
        }
    }, [initialData]);

    const handleAddClick = () => {
        if (!stampDetails.title?.trim()) {
            alert('El título es obligatorio.');
            return;
        }
        api.addStamp({stampData: stampDetails});
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-2xl font-serif font-bold text-brand-light mb-4">Añadir un Nuevo Sello</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-brand-muted mb-1">Título del Recuerdo</label>
                    <input
                        id="title"
                        type="text"
                        value={stampDetails.title || ''}
                        onChange={e => setStampDetails({...stampDetails, title: e.target.value})}
                        placeholder="Ej: Nuestra noche en la playa"
                        className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-accent"
                    />
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-brand-muted mb-1">Categoría</label>
                    <select
                        id="category"
                        value={stampDetails.category || 'Cita Memorable'}
                        onChange={e => setStampDetails({...stampDetails, category: e.target.value as StampCategory})}
                        className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-accent"
                    >
                        {stampCategories.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-brand-muted mb-1">Notas Privadas (opcional)</label>
                    <textarea
                        id="notes"
                        rows={3}
                        value={stampDetails.notes || ''}
                        onChange={e => setStampDetails({...stampDetails, notes: e.target.value})}
                        placeholder="Un detalle que no queréis olvidar..."
                        className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-accent"
                    />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="bg-brand-navy hover:bg-brand-navy/70 text-white font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
                <button onClick={handleAddClick} className="bg-brand-accent hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition">Añadir Sello</button>
            </div>
        </Modal>
    );
};


// Wrapper component to manage its own state
const PassportModal: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialStampData, setInitialStampData] = useState<StampData | null>(null);

    // This is a pattern to allow other components to open this modal easily
    // We can expose `openStampModal` via a context if needed, but for now this is local
    // Note: The new CoupleContext will handle opening this. Let's make this component simpler.
    // For now, let's assume it's just a presentation component.
    // The logic to open/close it has been moved to a new component that will wrap this logic
    // But for this case, let's make a dummy wrapper that doesn't do anything, as the real logic is in CoupleContext
    // The original app had a global modal system, so we will adapt to that.
    
    // For simplicity, let's assume the component doesn't exist and we make a new one.
    // The prompt says "update files", I will assume PassportModal is a view-only component now,
    // and the logic is handled by a wrapper or the parent.
    // However, the original App.tsx has a `<PassportModal />` at the root.
    // This implies a global state. Let's create a small context for it.
    
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<StampData | null>(null);
    
    // A simple event system to open the modal from anywhere
    useEffect(() => {
        const handler = (e: any) => {
            setIsOpen(true);
            setData(e.detail);
        };
        document.addEventListener('openPassportModal', handler);
        return () => document.removeEventListener('openPassportModal', handler);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setData(null);
    };

    return <PassportModalComponent isOpen={isOpen} onClose={handleClose} initialData={data} />;
};

export const openPassportModal = (data: StampData | null = null) => {
    document.dispatchEvent(new CustomEvent('openPassportModal', { detail: data }));
};

export default PassportModal;
