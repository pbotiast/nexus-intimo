
import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { BellIcon } from './Icons';
import NotificationHelpModal from './NotificationHelpModal';

const NotificationBell: React.FC = () => {
    const { permission, requestPermission } = useNotifications();
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    if (permission === 'granted') {
        return (
            <div className="flex items-center gap-2 text-green-400 text-xs justify-center">
                <BellIcon className="w-4 h-4" />
                <span>Notificaciones Activadas</span>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
             <>
                <button
                    onClick={() => setIsHelpModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 p-2 rounded-lg transition-colors text-xs"
                    title="Haz clic para ver cómo desbloquear las notificaciones"
                >
                    <BellIcon className="w-4 h-4" />
                    <span>Notificaciones Bloqueadas</span>
                </button>
                <NotificationHelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
             </>
        );
    }

    return (
        <button
            onClick={requestPermission}
            className="w-full flex items-center justify-center gap-2 text-brand-muted hover:text-brand-light hover:bg-brand-deep-purple p-2 rounded-lg transition-colors text-xs"
        >
            <BellIcon className="w-4 h-4" />
            <span>Activar Notificaciones</span>
        </button>
    );
};

export default NotificationBell;
