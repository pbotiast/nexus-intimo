import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import * as api from '../services/api';
import { CoupleContextType, CoupleData, StampData, PreferenceCategory, Feedback, Wish, BodyMark } from '../types';
import PairingModal from '../components/PairingModal';
import Loader from '../components/Loader';

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [coupleId, setCoupleId] = useLocalStorage<string | null>('coupleId', null);
    const [coupleData, setCoupleData] = useState<CoupleData | null>(null);
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const isPaired = !!coupleId && !!coupleData;

    useEffect(() => {
        const validateSession = async () => {
            if (coupleId) {
                try {
                    const data = await api.getCoupleData(coupleId);
                    setCoupleData(data);
                } catch (e) {
                    console.error("Session validation failed", e);
                    setCoupleId(null); // Invalid session, clear it
                    setCoupleData(null);
                }
            }
            setIsLoading(false);
        };
        validateSession();
    }, [coupleId, setCoupleId]);

    useEffect(() => {
        if (!coupleId) return;

        const events = new EventSource(`${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : ''}/api/couples/${coupleId}/events`);
        
        events.onmessage = (event) => {
            const parsedEvent = JSON.parse(event.data);
            if (parsedEvent.type === 'update') {
                setCoupleData(prevData => ({ ...prevData, ...parsedEvent.data } as CoupleData));
            }
        };

        events.onerror = (err) => {
            console.error('SSE Error:', err);
            // Optional: implement retry logic or notify user
            events.close();
        };

        return () => {
            events.close();
        };
    }, [coupleId]);

    const createCoupleSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { coupleId: newCoupleId, pairingCode: newPairingCode } = await api.createCoupleSession();
            setCoupleId(newCoupleId);
            setPairingCode(newPairingCode);
            const data = await api.getCoupleData(newCoupleId);
            setCoupleData(data);
        } catch (e: any) {
            setError(e.message || 'No se pudo crear la sesión. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, [setCoupleId]);

    const joinCoupleSession = useCallback(async (code: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { coupleId: joinedCoupleId, coupleData: joinedCoupleData } = await api.joinCoupleSession(code);
            setCoupleId(joinedCoupleId);
            setCoupleData(joinedCoupleData);
            setPairingCode(null);
        } catch (e: any) {
            const errorMessage = e.message || "Error al unirse a la sesión. Revisa el código y tu conexión.";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [setCoupleId]);

    const logout = useCallback(() => {
        setCoupleId(null);
        setCoupleData(null);
        setPairingCode(null);
    }, [setCoupleId]);
    
    // --- API Methods for components ---
    // This wraps the api calls with the coupleId
    const coupleApi = useMemo(() => {
        const createHandler = <T, U>(apiFn: (coupleId: string, args: T) => Promise<U>) => {
            return (args: T) => {
                if (!coupleId) throw new Error("Not paired");
                return apiFn(coupleId, args);
            };
        };
         const createSimpleHandler = <U,>(apiFn: (coupleId: string) => Promise<U>) => {
            return () => {
                if (!coupleId) throw new Error("Not paired");
                return apiFn(coupleId);
            };
        };
        
        return {
            generateEroticStory: createHandler(api.generateEroticStory),
            generatePersonalChallenge: createSimpleHandler(api.generatePersonalChallenge),
            generateCouplesChallenges: createSimpleHandler(api.generateCouplesChallenges),
            generateIcebreakerQuestion: createSimpleHandler(api.generateIcebreakerQuestion),
            generateRoleplayScenario: createHandler(api.generateRoleplayScenario),
            generateDateIdea: createHandler(api.generateDateIdea),
            generateGameChallenge: createHandler(api.generateGameChallenge),
            generateIntimateRitual: createHandler(api.generateIntimateRitual),
            generateWeeklyMission: createSimpleHandler(api.generateWeeklyMission),
            claimMissionReward: createSimpleHandler(api.claimMissionReward),
            generateRealWorldAdventure: createHandler(api.generateRealWorldAdventure),
            generateIntimateChronicle: createSimpleHandler(api.generateIntimateChronicle),
            generateSoulMirrorReflection: createHandler(api.generateSoulMirrorReflection),
            generateDailySpark: createHandler(api.generateDailySpark),
            continueNexoChat: createHandler(api.continueNexoChat),
            addStamp: createHandler(api.addStamp),
            deleteStamp: (id: string) => coupleId ? api.deleteStamp(coupleId, id) : Promise.reject("Not paired"),
            addWish: createHandler(api.addWish),
            revealWish: createSimpleHandler(api.revealWish),
            updateBodyMarks: createHandler(api.updateBodyMarks),
            generateTandemJournalPrompt: createSimpleHandler(api.generateTandemJournalPrompt),
            saveTandemAnswer: createHandler(api.saveTandemAnswer),
            recordFeedback: createHandler(api.recordFeedback),
            addKey: createSimpleHandler(api.addKey),
            useKey: createSimpleHandler(api.useKey),
            updateSexDice: createHandler(api.updateSexDice),
        };
    }, [coupleId]);

    const value: CoupleContextType = {
        coupleData,
        coupleId,
        isPaired,
        pairingCode,
        isLoading,
        createCoupleSession,
        joinCoupleSession,
        logout,
        api: coupleApi,
    };
    
    if (isLoading) {
        return <div className="w-screen h-screen flex justify-center items-center"><Loader text="Conectando con tu nexo..." /></div>;
    }

    return (
        <CoupleContext.Provider value={value}>
            {!isPaired ? <PairingModal error={error} /> : children}
        </CoupleContext.Provider>
    );
};

export const useCouple = (): CoupleContextType => {
    const context = useContext(CoupleContext);
    if (context === undefined) {
        throw new Error('useCouple must be used within a CoupleProvider');
    }
    return context;
};