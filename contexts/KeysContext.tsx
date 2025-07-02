
import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useNotifications } from './NotificationContext';

interface KeysContextType {
    keys: number;
    addKey: (amount?: number) => void;
    useKey: () => boolean;
}

const KeysContext = createContext<KeysContextType | undefined>(undefined);

export const KeysProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [keys, setKeys] = useLocalStorage<number>('trustKeys', 0);
    const { showNotification } = useNotifications();

    const addKey = (amount = 1) => {
        setKeys(prevKeys => prevKeys + amount);
        showNotification('¡Llave de la Confianza Obtenida!', 'Habéis ganado una nueva llave. Usadla en el Cofre de los Deseos para desvelar un secreto.');
    };

    const useKey = () => {
        if (keys > 0) {
            setKeys(prevKeys => prevKeys - 1);
            return true;
        }
        return false;
    };
    
    const value = { keys, addKey, useKey };

    return (
        <KeysContext.Provider value={value}>
            {children}
        </KeysContext.Provider>
    );
};

export const useKeys = (): KeysContextType => {
    const context = useContext(KeysContext);
    if (context === undefined) {
        throw new Error('useKeys must be used within a KeysProvider');
    }
    return context;
};