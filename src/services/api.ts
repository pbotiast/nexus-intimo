// src/services/api.ts - CÓDIGO COMPLETO

import { StoryParams, GeneratedStory } from '../types'; // Importa los tipos que necesites

// --- Función Helper ---
// Esta función centraliza la lógica de autenticación para todas las llamadas a la API.
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const userId = localStorage.getItem('nexusIntimoUserId');
    if (!userId) {
        throw new Error("User ID not found. The app needs to be re-initialized.");
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId, // ¡La cabecera de autenticación anónima!
        ...options.headers,
    };
    
    // El endpoint debe ser relativo para que funcione tanto en local como en producción.
    const response = await fetch(`/api${endpoint}`, { ...options, headers });

    if (!response.ok) {
        // Intenta parsear el error del backend para dar un mensaje más claro.
        const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred' }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    // Si la respuesta no tiene contenido (p.ej. en un 204 No Content), no intentes parsearla.
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return {} as T; // Devuelve un objeto vacío o maneja como prefieras.
    }
}

// --- NUEVAS FUNCIONES DE API PARA PAREJAS ---

export const generateInvitation = (): Promise<{ invitationCode: string }> =>
    fetchWithAuth('/couples/invite', { method: 'POST' });

export const acceptInvitation = (code: string): Promise<{ message: string; coupleId: string }> =>
    fetchWithAuth('/couples/accept', { 
        method: 'POST', 
        body: JSON.stringify({ invitationCode: code })
    });

export const getCoupleData = (): Promise<any> => // Tipar 'any' con la estructura de sharedData
    fetchWithAuth('/couples/data');

// --- EJEMPLO DE OTRAS FUNCIONES ---
// Todas las demás llamadas a la API deben seguir este patrón.

export const generateEroticStory = (params: StoryParams): Promise<GeneratedStory> =>
   fetchWithAuth('/couples/story', {
       method: 'POST',
       body: JSON.stringify({ params })
   });

// Puedes añadir aquí el resto de tus funciones de API (generateCouplesChallenges, etc.)
// siguiendo exactamente el mismo formato que generateEroticStory.
export const generateCouplesChallenges = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/challenges', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesAdventures = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/adventures', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesGames = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/games', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesActivities = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/activities', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimacy = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimacy', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateQuestions = (params: StoryParams): Promise<GeneratedStory> =>   
    fetchWithAuth('/couples/intimate-questions', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateGames = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-games', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateActivities = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-activities', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateAdventures = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-adventures', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateChallenges = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-challenges', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateStories = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-stories', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimatePrompts = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-prompts', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateReflections = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-reflections', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateMeditations = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-meditations', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 

export const generateCouplesIntimateExercises = (params: StoryParams): Promise<GeneratedStory> =>       
    fetchWithAuth('/couples/intimate-exercises', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateRituals = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-rituals', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateAffirmations = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-affirmations', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateVisualizations = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-visualizations', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateJournaling = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-journaling', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateMindfulness = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-mindfulness', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateExploration = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-exploration', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateDiscovery = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-discovery', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateGrowth = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-growth', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateTransformation = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-transformation', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateHealing = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-healing', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateEmpowerment = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-empowerment', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimatePassion = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-passion', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateDesire = (params: StoryParams): Promise<GeneratedStory> =>  
    fetchWithAuth('/couples/intimate-desire', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateFantasy = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-fantasy', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateRomance = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-romance', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateSeduction = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-seduction', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateAttraction = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-attraction', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateChemistry = (params: StoryParams): Promise<Generated
Story> =>
    fetchWithAuth('/couples/intimate-chemistry', {
        method: 'POST',
        body: JSON.stringify({ params })
    });         
export const generateCouplesIntimateConnection = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-connection', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateBonding = (params: StoryParams): Promise<GeneratedStory> =>     
    fetchWithAuth('/couples/intimate-bonding', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateUnity = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-unity', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateSynergy = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-synergy', {
        method: 'POST',
        body: JSON.stringify({ params })
    }); 
export const generateCouplesIntimateHarmony = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-harmony', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
export const generateCouplesIntimateBalance = (params: StoryParams): Promise<GeneratedStory> =>
    fetchWithAuth('/couples/intimate-balance', {
        method: 'POST',
        body: JSON.stringify({ params })
    });
    