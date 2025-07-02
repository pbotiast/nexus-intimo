

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import type { NotificationPermission, NotificationContextType } from '../types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    // Effect to sync permission status
    useEffect(() => {
        if (!('Notification' in window)) {
            console.log('Este navegador no soporta notificaciones de escritorio.');
            return;
        }

        const updatePermissionStatus = () => {
             setPermission(Notification.permission as NotificationPermission);
        }

        // Use Permissions API for dynamic updates if available
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'notifications' }).then((permissionStatus) => {
                updatePermissionStatus();
                permissionStatus.onchange = updatePermissionStatus;
            });
        } else {
             // Fallback for browsers that do not support Permissions API
            updatePermissionStatus();
        }
    }, []);

    const showNotification = useCallback((title: string, body: string) => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }
        
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                // icon: '/assets/icon.png',
                // badge: '/assets/badge.png',
            });
        }).catch(err => console.error("Service Worker not ready:", err));
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            alert('Este navegador no soporta notificaciones de escritorio.');
            return;
        }
        
        try {
            // The user gesture is required to call requestPermission
            const status = await Notification.requestPermission();
            // The state will be updated by the onchange handler, but we can set it here for immediate UI feedback.
            setPermission(status);
            if (status === 'granted') {
                showNotification('¡Notificaciones Activadas!', 'Ahora recibirás nuestras actualizaciones y recordatorios.');
            }
        } catch (err) {
            console.error('Error al solicitar permiso para notificaciones:', err);
        }
    }, [showNotification]);

    // Proactive notification example for when the app is opened
    useEffect(() => {
        if (permission === 'granted') {
             const timer = setTimeout(() => {
                const now = new Date();
                const day = now.getDay();
                
                // Example: Remind on Friday evenings
                if (day === 5) { // Friday
                    showNotification(
                        '✨ ¿Listos para el fin de semana?', 
                        'Es un momento perfecto para conectar. ¿Qué tal un Ritual Íntimo para empezar?'
                    );
                }
             }, 5000); // Check 5s after load

            return () => clearTimeout(timer);
        }
    }, [permission, showNotification]);

    const value = { permission, requestPermission, showNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};