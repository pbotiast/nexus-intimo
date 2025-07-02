
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useKeys } from './KeysContext';
import type { PassportContextType, StampData, PassionStamp } from '../types';

const PassportContext = createContext<PassportContextType | undefined>(undefined);

export const PassportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stamps, setStamps] = useLocalStorage<PassionStamp[]>('passionStamps', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialStampData, setInitialStampData] = useState<StampData | null>(null);
    const { addKey } = useKeys();

    const openStampModal = useCallback((data: StampData = {}) => {
        setInitialStampData(data);
        setIsModalOpen(true);
    }, []);

    const closeStampModal = useCallback(() => {
        setIsModalOpen(false);
        setInitialStampData(null);
    }, []);

    const addStamp = useCallback((stampData: StampData) => {
        if (!stampData.title?.trim()) return;
        
        const oldStampsCount = stamps.length;
        const stampToAdd: PassionStamp = {
            id: new Date().toISOString(),
            date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
            category: stampData.category || 'Cita Memorable',
            title: stampData.title,
            notes: stampData.notes || '',
        };
        
        const newStamps = [...stamps, stampToAdd];
        setStamps(newStamps);

        const oldKeyMilestone = Math.floor(oldStampsCount / 5);
        const newKeyMilestone = Math.floor(newStamps.length / 5);

        if (newKeyMilestone > oldKeyMilestone) {
            addKey();
        }

        closeStampModal();
    }, [stamps, setStamps, addKey, closeStampModal]);

    const deleteStamp = useCallback((id: string) => {
        if(window.confirm('¿Seguro que quieres borrar este recuerdo para siempre?')) {
            setStamps(stamps.filter(s => s.id !== id));
        }
    }, [stamps, setStamps]);

    const value = {
        stamps,
        addStamp,
        deleteStamp,
        isModalOpen,
        initialStampData,
        openStampModal,
        closeStampModal,
    };

    return (
        <PassportContext.Provider value={value}>
            {children}
        </PassportContext.Provider>
    );
};

export const usePassport = (): PassportContextType => {
    const context = useContext(PassportContext);
    if (context === undefined) {
        throw new Error('usePassport must be used within a PassportProvider');
    }
    return context;
};
