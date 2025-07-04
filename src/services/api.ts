// src/services/api.ts - VERSIÓN FINAL CON AUTENTICACIÓN JWT

import { 
    // Asegúrate de que todos los tipos que usas estén definidos en este archivo.
    // Es una buena práctica tener un archivo central de tipos.
    StoryParams, GeneratedStory, CoupleChallenge, IcebreakerQuestion, 
    RoleplayScenario, DateIdea, IntimateRitual, WeeklyMission, 
    CoupleData, BodyMark, StampData, Wish 
} from '../types'; 

// Determina la URL base de la API para que funcione en local y en producción.
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:3001' // URL para desarrollo local
    : ''; // Ruta relativa para producción (Render, Vercel, etc.)

/**
 * Función centralizada para realizar todas las llamadas a la API.
 * Automáticamente añade el token de autenticación a cada petición si existe.
 */
async function fetchFromApi<TResponse>(endpoint: string, options: RequestInit = {}): Promise<TResponse> {
    
    // 1. Obtiene el token de autenticación desde el localStorage.
    const token = localStorage.getItem('authToken');

    // 2. Prepara los encabezados base.
    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // 3. Si se encuentra un token, lo añade al encabezado 'Authorization'.
    if (token) {
        baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 4. Combina los encabezados base con cualquier encabezado personalizado.
    const headers = { ...baseHeaders, ...options.headers };

    // 5. Realiza la petición fetch.
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // 6. Maneja respuestas de error.
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido en el servidor.' }));
        throw new Error(errorData.message || `No se pudo completar la solicitud. Estado: ${response.status}`);
    }
    
    // 7. Maneja respuestas sin cuerpo JSON (ej. un 204 No Content).
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return {} as TResponse;
    }
}


// --- FUNCIONES DE API ---

// --- Autenticación y Gestión de Usuario ---
// NOTA: Estas rutas deben coincidir con las de tu backend (server.ts)

export const loginUser = (credentials: { email: string, password: string }): Promise<{ accessToken: string, user: any }> =>
    fetchFromApi('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });

export const registerUser = (credentials: { email: string, password: string }): Promise<{ message: string }> =>
    fetchFromApi('/api/auth/register', { method: 'POST', body: JSON.stringify(credentials) });

export const getMyProfile = (): Promise<any> => // Deberías tener un tipo UserProfile
    fetchFromApi('/api/users/me');


// --- Sesión y Emparejamiento ---
// Estas rutas asumen que el usuario ya está autenticado (tiene un token).

export const generateInvitation = (): Promise<{ invitationCode: string }> =>
    fetchFromApi('/api/couples/invite', { method: 'POST' });

export const acceptInvitation = (code: string): Promise<{ message: string; coupleData: CoupleData }> =>
    fetchFromApi('/api/couples/accept', { method: 'POST', body: JSON.stringify({ invitationCode: code }) });

export const getCurrentCoupleData = (): Promise<CoupleData> =>
    fetchFromApi('/api/couples/data');


// --- Generadores de Contenido con IA ---
// Todas estas funciones requieren que el usuario esté en una pareja.

export const generateEroticStory = (params: StoryParams): Promise<GeneratedStory> =>
   fetchFromApi('/api/ai/story', {
       method: 'POST',
       body: JSON.stringify({ params })
   });

export const generateCouplesChallenges = (): Promise<{ challenges: CoupleChallenge[] }> =>
   fetchFromApi('/api/ai/challenges', {
       method: 'POST'
   });

export const generateIcebreakerQuestion = (): Promise<IcebreakerQuestion> =>
   fetchFromApi('/api/ai/icebreaker-question', {
       method: 'POST'
   });

export const generateDateIdea = (category: string): Promise<DateIdea> =>
    fetchFromApi('/api/ai/date-idea', {
        method: 'POST',
        body: JSON.stringify({ category })
    });

export const generateRoleplayScenario = (theme: string): Promise<RoleplayScenario> =>
    fetchFromApi('/api/ai/roleplay-scenario', {
        method: 'POST',
        body: JSON.stringify({ theme })
    });

export const generateIntimateRitual = (energy: string): Promise<IntimateRitual> =>
    fetchFromApi('/api/ai/intimate-ritual', {
        method: 'POST',
        body: JSON.stringify({ energy })
    });

export const generateWeeklyMission = (params: any): Promise<WeeklyMission> =>
    fetchFromApi('/api/ai/weekly-mission', {
        method: 'POST',
        body: JSON.stringify({ params })
    });


// --- Actualización de Datos de la Pareja ---

export const addStamp = (stampData: StampData): Promise<{ success: boolean }> =>
    fetchFromApi('/api/data/stamps', {
        method: 'POST',
        body: JSON.stringify({ stampData })
    });

export const addWish = (wish: Wish): Promise<{ success: boolean }> =>
    fetchFromApi('/api/data/wishes', {
        method: 'POST',
        body: JSON.stringify(wish)
    });

export const updateBodyMark = (bodyMark: BodyMark): Promise<{ success: boolean }> =>
    fetchFromApi('/api/data/bodymarks', {
        method: 'POST',
        body: JSON.stringify(bodyMark)
    });

export const submitJournalAnswer = (answer: { partner: 'partner1' | 'partner2', answer: string }): Promise<{ success: boolean }> =>
    fetchFromApi('/api/data/journal/answer', {
        method: 'POST',
        body: JSON.stringify(answer)
    });

    
