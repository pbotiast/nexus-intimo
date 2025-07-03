import React, { createContext, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useNotifications } from './NotificationContext';
import { useAiPreferences } from '../hooks/useAiPreferences';
import { StoredDailySpark, PassionCompassScores, StampCategory } from '../types';
import { useCouple } from './CoupleContext';

const EmpathyEngineContext = createContext<{} | undefined>(undefined);

const pillarMapping: Record<StampCategory, keyof PassionCompassScores> = {
    'Cita Memorable': 'Conexión Emocional',
    'Logro Personal': 'Conexión Emocional',
    'Lugar Inusual': 'Aventura y Novedad',
    'Juego de Rol': 'Juego y Diversión',
    'Fantasía Cumplida': 'Fantasía e Intensidad',
    'Postura Nueva': 'Fantasía e Intensidad',
};

const preferenceMapping: Record<string, keyof PassionCompassScores> = {
    'ritual_energy:Conexión Tierna': 'Conexión Emocional',
    'challenge_type:Pregunta Íntima': 'Conexión Emocional',
    'date_category:Aventura': 'Aventura y Novedad',
    'real_world_adventure': 'Aventura y Novedad',
    'mission_title': 'Aventura y Novedad',
    'ritual_energy:Juego y Diversión': 'Juego y Diversión',
    'challenge_level:Picante': 'Juego y Diversión',
    'story_theme': 'Fantasía e Intensidad',
    'story_intensity': 'Fantasía e Intensidad',
    'ritual_energy:Pasión Intensa': 'Fantasía e Intensidad',
    'wish': 'Fantasía e Intensidad',
};


export const EmpathyEngineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { permission, showNotification } = useNotifications();
    const [lastSparkDate, setLastSparkDate] = useLocalStorage<string | null>('lastSparkDate', null);
    const { coupleData, api } = useCouple();
    const { preferences } = useAiPreferences();

    const stamps = coupleData?.stamps || [];

    const compassScores = useMemo<PassionCompassScores>(() => {
        const scores: PassionCompassScores = {
            'Conexión Emocional': 0, 'Aventura y Novedad': 0, 'Juego y Diversión': 0, 'Fantasía e Intensidad': 0,
        };
        stamps.forEach(stamp => {
            const pillar = pillarMapping[stamp.category];
            if (pillar) scores[pillar] += 10;
        });
        Object.entries(preferences).forEach(([key, value]) => {
            const baseKey = key.split(':')[0];
            const pillar = preferenceMapping[key] || preferenceMapping[baseKey];
            if (pillar && value > 0) scores[pillar] += (value * 5);
        });
        return scores;
    }, [stamps, preferences]);

    const triggerDailySpark = useCallback(async () => {
        if (permission !== 'granted' || !coupleData) return;

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        if (lastSparkDate !== today) {
            console.log("Generating a new Daily Spark...");
            try {
                const newSpark = await api.generateDailySpark({scores: compassScores});
                if(newSpark) {
                    setLastSparkDate(today);
                    showNotification(`✨ Chispa Diaria: ${newSpark.title}`, newSpark.description);
                }
            } catch (error) {
                console.error("Failed to generate or show Daily Spark:", error);
            }
        } else {
             console.log("It's not time for a new Daily Spark yet.");
        }
    }, [permission, lastSparkDate, coupleData, api, compassScores, setLastSparkDate, showNotification]);

    useEffect(() => {
        const timer = setTimeout(() => {
            triggerDailySpark();
        }, 5000); // Trigger 5s after app load to ensure context is ready
        return () => clearTimeout(timer);
    }, [triggerDailySpark]);
    
    return (
        <EmpathyEngineContext.Provider value={{}}>
            {children}
        </EmpathyEngineContext.Provider>
    );
};

export const useEmpathyEngine = (): {} => {
    const context = useContext(EmpathyEngineContext);
    if (context === undefined) {
        throw new Error('useEmpathyEngine must be used within an EmpathyEngineProvider');
    }
    return context;
};
