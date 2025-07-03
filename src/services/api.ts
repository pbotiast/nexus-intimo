// src/services/api.ts - CÓDIGO CORREGIDO

import { CoupleData, StampData, StoryParams, GeneratedStory, PersonalChallenge, RoleplayScenario, DateIdea, GameChallenge, IntimateRitual, StoredWeeklyMission, RealWorldAdventure, IntimateChronicle, SoulReflection, DailySpark, ChatMessage, Wish, BodyMark, TandemEntry, Feedback, SexDice, PassionCompassScores } from '../types';

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001/api'
  : '/api';

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ocurrió un error desconocido' }));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }
    return response.json();
}

// --- Gestión de Sesión ---
export const createCoupleSession = (): Promise<{ coupleId: string; pairingCode: string }> => 
    fetchFromApi('/couples', { method: 'POST' });

export const joinCoupleSession = (code: string): Promise<{ coupleId: string; coupleData: CoupleData }> => 
    fetchFromApi('/couples/join', { method: 'POST', body: JSON.stringify({ code }) });

export const getCoupleData = (coupleId: string): Promise<CoupleData> => 
    fetchFromApi(`/couples/${coupleId}/data`);

// --- Endpoints de Generación por IA (AHORA APUNTAN A RUTAS ESPECÍFICAS) ---
export const generateEroticStory = (coupleId: string, { params }: { params: StoryParams }): Promise<GeneratedStory> =>
    fetchFromApi(`/couples/${coupleId}/story`, { method: 'POST', body: JSON.stringify({ params }) });
    
export const generateCouplesChallenges = (coupleId: string): Promise<PersonalChallenge[]> =>
    fetchFromApi(`/couples/${coupleId}/couples-challenges`, { method: 'POST' });

export const generateDateIdea = (coupleId: string, { category }: { category: string }): Promise<DateIdea> =>
    fetchFromApi(`/couples/${coupleId}/date-idea`, { method: 'POST', body: JSON.stringify({ category }) });

export const generateIntimateRitual = (coupleId: string, { energy }: { energy: string }): Promise<IntimateRitual> =>
    fetchFromApi(`/couples/${coupleId}/intimate-ritual`, { method: 'POST', body: JSON.stringify({ energy }) });

// ... Aquí irían las llamadas a las otras rutas específicas que implementes ...
// Por ahora, las otras funciones pueden fallar o necesitarás añadir sus rutas en server.ts
// Ejemplo de cómo se vería una función que aún no tiene su ruta en el backend:
export const generateRoleplayScenario = (coupleId: string, { theme }: { theme: string }): Promise<RoleplayScenario> => {
    // Esta fallará hasta que crees la ruta '/couples/:coupleId/roleplay' en server.ts
    return fetchFromApi(`/couples/${coupleId}/roleplay`, { method: 'POST', body: JSON.stringify({ theme }) });
}

// --- Endpoints de Gestión de Datos ---
// (Estos necesitan sus propias rutas POST/DELETE en el backend, no usan la IA)
// ...
