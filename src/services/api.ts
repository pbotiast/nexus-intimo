// src/services/api.ts - VERSIÓN DEFINITIVA Y COMPLETA PARA EL REPOSITORIO

import {
    // Importa todos los tipos que tus funciones de API necesitan
    CoupleData,
    SexDiceState,
    StoryParams,
    GeneratedStory,
    PersonalChallenge,
    CoupleChallenge,
    IcebreakerQuestion,
    RoleplayScenario,
    DateIdea,
    GameChallenge,
    IntimateRitual,
    StampData,
    Wish,
    BodyMark,
    PreferenceCategory,
    Feedback,
} from '../types';

// Determina la URL base de la API para que funcione en local y en producción
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:3001' 
    : '';

/**
 * Función centralizada para realizar todas las llamadas a la API.
 * Automáticamente añade el token de autenticación a cada petición si existe.
 */
async function fetchFromApi<TResponse>(endpoint: string, options: RequestInit = {}): Promise<TResponse> {
    // La clave 'authToken' debe coincidir con la que usas al guardar el token en el login.
    const token = localStorage.getItem('authToken');
    const baseHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

    if (token) {
        baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    const headers = { ...baseHeaders, ...options.headers };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido en el servidor.' }));
        throw new Error(errorData.message || `No se pudo completar la solicitud. Estado: ${response.status}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return {} as TResponse;
    }
}

// --- FUNCIONES DE API ---

// Para Home.tsx
export const createCoupleSession = () => fetchFromApi<{ coupleId: string; pairingCode: string }>('/api/couples/create', { method: 'POST' });
export const joinCoupleSession = (code: string) => fetchFromApi<{ coupleId: string; coupleData: CoupleData }>('/api/couples/join', { method: 'POST', body: JSON.stringify({ code }) });

// Para PairingPage.tsx
export const generateInvitation = () => fetchFromApi<{ invitationCode: string }>('/api/couples/invite', { method: 'POST' });
export const acceptInvitation = (code: string) => fetchFromApi<{ message: string, coupleId: string }>('/api/couples/accept', { method: 'POST', body: JSON.stringify({ invitationCode: code }) });

// Para CoupleContext.tsx y otros
export const getCoupleData = (coupleId: string) => fetchFromApi<CoupleData>(`/api/couples/${coupleId}`);

// "Fábrica" de funciones para llamadas a la API que requieren un coupleId. Simplifica el código.
const createCoupleApiCall = <TBody, TResponse>(endpoint:string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => 
    (coupleId: string, body?: TBody): Promise<TResponse> => {
        const options: RequestInit = { method };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return fetchFromApi<TResponse>(`/api/couples/${coupleId}/${endpoint}`, options);
    };

// Funciones usadas en CoupleContext.tsx
export const updateSexDice = createCoupleApiCall<{ dice: SexDiceState }, { success: boolean }>('sex-dice', 'PUT');
export const generateEroticStory = createCoupleApiCall<{ params: StoryParams }, GeneratedStory>('erotic-story');
export const generatePersonalChallenge = createCoupleApiCall<{}, PersonalChallenge>('personal-challenge');
export const generateCouplesChallenges = createCoupleApiCall<{}, { challenges: CoupleChallenge[] }>('couples-challenges');
export const generateIcebreakerQuestion = createCoupleApiCall<{}, IcebreakerQuestion>('icebreaker-question');
export const generateRoleplayScenario = createCoupleApiCall<{ theme: string }, RoleplayScenario>('roleplay-scenario');
export const generateDateIdea = createCoupleApiCall<{ category: string }, DateIdea>('date-idea');
export const generateGameChallenge = createCoupleApiCall<{ type: GameChallenge['type'] }, GameChallenge>('game-challenge');
export const generateIntimateRitual = createCoupleApiCall<{ energy: 'calm' | 'passionate' | 'playful' }, IntimateRitual>('intimate-ritual');
export const addStamp = createCoupleApiCall<{ stampData: StampData }, { success: boolean }>('stamps');
export const addWish = createCoupleApiCall<{ text: string }, { success: boolean }>('wishes');
export const revealWish = createCoupleApiCall<{}, Wish | null>('wishes/reveal');
export const recordFeedback = createCoupleApiCall<{ category: PreferenceCategory, value: string, feedback: Feedback }, { success: boolean }>('feedback');
export const addKey = createCoupleApiCall<{}, { success: boolean }>('add-key');
export const useKey = createCoupleApiCall<{}, { success: boolean }>('use-key');

// Funciones que no encajan en la "fábrica" porque tienen una URL diferente
export const deleteStamp = (coupleId: string, stampId: string) => fetchFromApi(`/api/couples/${coupleId}/stamps/${stampId}`, { method: 'DELETE' });

// Para BodyMapPage.tsx
export const updateBodyMarks = createCoupleApiCall<{ marks: BodyMark[] }, { success: boolean }>('body-marks', 'PUT');

// Para TandemJournalPage.tsx
export const generateTandemJournalPrompt = createCoupleApiCall<{}, { prompt: string }>('tandem-journal/prompt');
export const saveTandemAnswer = createCoupleApiCall<{ partner: 'partner1' | 'partner2', answer: string }, { success: boolean }>('tandem-journal/answer');
// Para PreferencesPage.tsx
export const getPreferences = (coupleId: string) => fetchFromApi<PreferenceCategory[]>(`/api/couples/${coupleId}/preferences`);
export const updatePreferences = createCoupleApiCall<{ preferences: PreferenceCategory[] }, { success: boolean }>('preferences', 'PUT');  
// Para FeedbackPage.tsx
export const getFeedback = (coupleId: string) => fetchFromApi<Feedback[]>(`/api/couples/${coupleId}/feedback`); 
// Para CoupleSettingsPage.tsx
export const updateCoupleSettings = createCoupleApiCall<{ settings: Partial<CoupleData> }, { success: boolean }>('settings', 'PUT');  
// Para CoupleProfilePage.tsx
export const getCoupleProfile = (coupleId: string) => fetchFromApi<CoupleData>(`/api/couples/${coupleId}/profile`); 
// Para CoupleHistoryPage.tsx
export const getCoupleHistory = (coupleId: string) => fetchFromApi<{ history: any[] }>(`/api/couples/${coupleId}/history`); 
// Para CoupleAchievementsPage.tsx
export const getCoupleAchievements = (coupleId: string) => fetchFromApi<{ achievements: any[] }>(`/api/couples/${coupleId}/achievements`);  
// Para CoupleNotificationsPage.tsx
export const getCoupleNotifications = (coupleId: string) => fetchFromApi<{ notifications: any[] }>(`/api/couples/${coupleId}/notifications`);
// Para CoupleSupportPage.tsx
export const getCoupleSupport = (coupleId: string) => fetchFromApi<{ support: any[] }>(`/api/couples/${coupleId}/support`);
// Para CoupleResourcesPage.tsx
export const getCoupleResources = (coupleId: string) => fetchFromApi<{ resources: any[] }>(`/api/couples/${coupleId}/resources`);
// Para CoupleGoalsPage.tsx
export const getCoupleGoals = (coupleId: string) => fetchFromApi<{ goals: any[] }>(`/api/couples/${coupleId}/goals`); 
// Para CoupleEventsPage.tsx
export const getCoupleEvents = (coupleId: string) => fetchFromApi<{ events: any[] }>(`/api/couples/${coupleId}/events`);
// Para CoupleRemindersPage.tsx
export const getCoupleReminders = (coupleId: string) => fetchFromApi<{ reminders: any[] }>(`/api/couples/${coupleId}/reminders`);
// Para CoupleJournalPage.tsx
export const getCoupleJournal = (coupleId: string) => fetchFromApi<{ journal: any[] }>(`/api/couples/${coupleId}/journal`);
// Para CoupleActivitiesPage.tsx
export const getCoupleActivities = (coupleId: string) => fetchFromApi<{ activities: any[] }>(`/api/couples/${coupleId}/activities`);
// Para CoupleTasksPage.tsx
export const getCoupleTasks = (coupleId: string) => fetchFromApi<{ tasks: any[] }>(`/api/couples/${coupleId}/tasks`);
// Para CoupleMilestonesPage.tsx
export const getCoupleMilestones = (coupleId: string) => fetchFromApi<{ milestones: any[] }>(`/api/couples/${coupleId}/milestones`);
// Para CouplePlansPage.tsx
export const getCouplePlans = (coupleId: string) => fetchFromApi<{ plans: any[] }>(`/api/couples/${coupleId}/plans`);
// Para CoupleDreamsPage.tsx
export const getCoupleDreams = (coupleId: string) => fetchFromApi<{ dreams: any[] }>(`/api/couples/${coupleId}/dreams`);
// Para CoupleFavoritesPage.tsx 
export const getCoupleFavorites = (coupleId: string) => fetchFromApi<{ favorites: any[] }>(`/api/couples/${coupleId}/favorites`);
// Para CoupleSharedInterestsPage.tsx
export const getCoupleSharedInterests = (coupleId: string) => fetchFromApi<{ sharedInterests: any[] }>(`/api/couples/${coupleId}/shared-interests`);
// Para CoupleSharedGoalsPage.tsx
export const getCoupleSharedGoals = (coupleId: string) => fetchFromApi<{ sharedGoals: any[] }>(`/api/couples/${coupleId}/shared-goals`);
// Para CoupleSharedValuesPage.tsx
export const getCoupleSharedValues = (coupleId: string) => fetchFromApi<{ sharedValues: any[] }>(`/api/couples/${coupleId}/shared-values`);
// Para CoupleSharedDreamsPage.tsx
export const getCoupleSharedDreams = (coupleId: string) => fetchFromApi<{ sharedDreams: any[] }>(`/api/couples/${coupleId}/shared-dreams`);
// Para CoupleSharedMemoriesPage.tsx
export const getCoupleSharedMemories = (coupleId: string) => fetchFromApi<{ sharedMemories: any[] }>(`/api/couples/${coupleId}/shared-memories`);
// Para CoupleSharedExperiencesPage.tsx
export const getCoupleSharedExperiences = (coupleId: string) => fetchFromApi<{ sharedExperiences: any[] }>(`/api/couples/${coupleId}/shared-experiences`);
// Para CoupleSharedChallengesPage.tsx
export const getCoupleSharedChallenges = (coupleId: string) => fetchFromApi<{ sharedChallenges: any[] }>(`/api/couples/${coupleId}/shared-challenges`);
// Para CoupleSharedAchievementsPage.tsx
export const getCoupleSharedAchievements = (coupleId: string) => fetchFromApi<{ sharedAchievements: any[] }>(`/api/couples/${coupleId}/shared-achievements`);
// Para CoupleSharedSuccessesPage.tsx
export const getCoupleSharedSuccesses = (coupleId: string) => fetchFromApi<{ sharedSuccesses: any[] }>(`/api/couples/${coupleId}/shared-successes`);
