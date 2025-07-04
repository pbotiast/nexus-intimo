<<<<<<< HEAD
// src/services/api.ts
import { CoupleData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Función auxiliar para manejar respuestas de la API
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en la solicitud a la API');
  }
  return response.json();
}

// Función auxiliar para incluir el token de autorización
async function fetchWithAuth(url: string, options: RequestInit = {}, idToken: string) {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`, // Añadir el token de autorización
  };
  return fetch(url, { ...options, headers });
}

// API para crear una nueva pareja
export async function createCoupleApiCall(idToken: string): Promise<{ coupleId: string; pairingCode: string }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/create`, {
    method: 'POST',
    body: JSON.stringify({}), // No necesitamos userId en el body, viene del token
  }, idToken);
  return handleResponse(response);
}

// API para unirse a una pareja existente
export async function joinCoupleApiCall(code: string, idToken: string): Promise<{ coupleId: string; coupleData: CoupleData }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/join`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }, idToken);
  return handleResponse(response);
}

// API para obtener los datos de la pareja
export async function getCoupleDataApiCall(coupleId: string, idToken: string): Promise<CoupleData> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/${coupleId}`, {
    method: 'GET',
  }, idToken);
  return handleResponse(response);
}

// API para actualizar los deseos de la pareja
export async function updateDesiresApiCall(coupleId: string, desires: string[], idToken: string): Promise<CoupleData> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/${coupleId}/desires`, {
    method: 'POST',
    body: JSON.stringify({ desires }),
  }, idToken);
  return handleResponse(response);
}

// API para actualizar el body map de la pareja
export async function updateBodyMapApiCall(coupleId: string, bodyMap: { [key: string]: string }, idToken: string): Promise<CoupleData> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/${coupleId}/bodymap`, {
    method: 'POST',
    body: JSON.stringify({ bodyMap }),
  }, idToken);
  return handleResponse(response);
}

// API para generar una historia erótica
export async function generateEroticStoryApiCall(coupleId: string, params: { theme: string; intensity: string; length: string; protagonists: string }, idToken: string): Promise<{ title: string; content: string[] }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/${coupleId}/erotic-story`, {
    method: 'POST',
    body: JSON.stringify({ params }),
  }, idToken);
  return handleResponse(response);
}

// API para generar un reto personal
export async function generatePersonalChallengeApiCall(coupleId: string, idToken: string): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/${coupleId}/personal-challenge`, {
    method: 'POST',
  }, idToken);
  return handleResponse(response);
}

// API para abandonar una pareja
export async function leaveCoupleApiCall(coupleId: string, idToken: string): Promise<{ message: string }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/couples/${coupleId}/leave`, {
    method: 'POST',
  }, idToken);
  return handleResponse(response);
}

// Puedes añadir más funciones API aquí para otras rutas del backend
// Por ejemplo, para obtener posiciones sexuales, guías de audio, etc.
// Asegúrate de que cada función maneje correctamente el token de autorización y los errores
// También puedes crear funciones genéricas para manejar GET, POST, PUT, DELETE si lo prefieres
// Por ejemplo, una función genérica para hacer peticiones GET:
async function fetchGet(url: string, idToken: string) {
  const response = await fetchWithAuth(url, { method: 'GET' }, idToken);
  return handleResponse(response);
}   
// Y una para POST:
async function fetchPost(url: string, body: any, idToken: string) {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(body),
  }, idToken);
  return handleResponse(response);
}
// Puedes usar estas funciones genéricas en lugar de las específicas si lo prefieres
// Por ejemplo, para obtener posiciones sexuales podrías hacer algo así:    
// export async function getSexualPositionsApiCall(idToken: string): Promise<SexualPosition[]> {
//   return fetchGet(`${API_BASE_URL}/api/sexual-positions`, idToken);
// }
// Y para crear una guía de audio podrías hacer algo así:
// export async function createAudioGuideApiCall(guide: AudioGuide, idToken: string): Promise<AudioGuide> {
//   return fetchPost(`${API_BASE_URL}/api/audio-guides`, guide, idToken);
// }
// Asegúrate de que todas las funciones manejen correctamente los errores y el token de autorización
// También puedes crear funciones para manejar PUT, DELETE si es necesario  
// Por ejemplo, para actualizar una guía de audio podrías hacer algo así:
// export async function updateAudioGuideApiCall(guideId: string, guide: AudioGuide, idToken: string): Promise<AudioGuide> {
//   return fetchPost(`${API_BASE_URL}/api/audio-guides/${guideId}`, guide, idToken);
// }
// Y para eliminar una guía de audio podrías hacer algo así:
// export async function deleteAudioGuideApiCall(guideId: string, idToken: string): Promise<{ message: string }> {
//   const response = await fetchWithAuth(`${API_BASE_URL}/api/audio-guides/${guideId}`, {
//     method: 'DELETE',
//   }, idToken);
//   return handleResponse(response);
// }    
=======
// src/services/api.ts - VERSIÓN FINAL Y COMPLETA

import { 
    StoryParams, GeneratedStory, PersonalChallenge, CoupleChallenge, IcebreakerQuestion, 
    RoleplayScenario, DateIdea, GameChallenge, IntimateRitual, RitualEnergy, AiPreferences, 
    WeeklyMission, RealWorldAdventure, PassionStamp, IntimateChronicle, AdventureStyle, 
    SoulReflection, PassionCompassScores, DailySpark, ChatMessage, CoupleData, BodyMark, 
    TandemEntry, StampData, PreferenceCategory, Feedback, Wish 
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
    const token = localStorage.getItem('authToken');

    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    const headers = { ...baseHeaders, ...options.headers };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

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

// Sesión y Emparejamiento
export const createCoupleSession = () => fetchFromApi<{ coupleId: string; pairingCode: string }>('/api/couples/create', { method: 'POST' });
export const joinCoupleSession = (code: string) => fetchFromApi<{ coupleId: string; coupleData: CoupleData }>('/api/couples/join', { method: 'POST', body: JSON.stringify({ code }) });
export const getCoupleData = (coupleId: string) => fetchFromApi<CoupleData>(`/api/couples/${coupleId}`);

// "Fábrica" de funciones para llamadas a la API que requieren un coupleId.
const createCoupleApiCall = <TBody, TResponse>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => 
    (coupleId: string, body?: TBody): Promise<TResponse> => {
        const options: RequestInit = { method };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return fetchFromApi<TResponse>(`/api/couples/${coupleId}/${endpoint}`, options);
    };

// --- Generadores de Contenido ---
export const generateEroticStory = createCoupleApiCall<{ params: StoryParams }, GeneratedStory>('erotic-story');
export const generatePersonalChallenge = createCoupleApiCall<{}, PersonalChallenge>('personal-challenge');
export const generateCouplesChallenges = createCoupleApiCall<{}, { challenges: CoupleChallenge[] }>('couples-challenges');
export const generateIcebreakerQuestion = createCoupleApiCall<{}, IcebreakerQuestion>('icebreaker-question');
export const generateRoleplayScenario = createCoupleApiCall<{ theme: string }, RoleplayScenario>('roleplay-scenario');
export const generateDateIdea = createCoupleApiCall<{ category: string }, DateIdea>('date-idea');
export const generateGameChallenge = createCoupleApiCall<{ type: GameChallenge['type'] }, GameChallenge>('game-challenge');
export const generateIntimateRitual = createCoupleApiCall<{ energy: RitualEnergy }, IntimateRitual>('intimate-ritual');
export const generateWeeklyMission = createCoupleApiCall<{}, { success: boolean }>('weekly-mission');
export const generateRealWorldAdventure = createCoupleApiCall<{ coords: { latitude: number, longitude: number }, style: AdventureStyle }, RealWorldAdventure>('real-world-adventure');
export const generateIntimateChronicle = createCoupleApiCall<{}, IntimateChronicle>('intimate-chronicle');
export const generateSoulMirrorReflection = createCoupleApiCall<{ scores: PassionCompassScores }, SoulReflection>('soul-mirror-reflection');
export const generateDailySpark = createCoupleApiCall<{ scores: PassionCompassScores }, DailySpark>('daily-spark');
export const continueNexoChat = createCoupleApiCall<{ messages: ChatMessage[] }, { text: string }>('nexo-chat');

// --- Modificadores de Estado (PUT, POST, DELETE) ---
export const claimMissionReward = createCoupleApiCall<{}, { success: boolean }>('claim-mission-reward');
export const addStamp = createCoupleApiCall<{ stampData: StampData }, { success: boolean }>('stamps');
export const deleteStamp = (coupleId: string, stampId: string) => fetchFromApi(`/api/couples/${coupleId}/stamps/${stampId}`, { method: 'DELETE' });
export const addWish = createCoupleApiCall<{ text: string }, { success: boolean }>('wishes');
export const revealWish = createCoupleApiCall<{}, Wish | null>('wishes/reveal');
export const updateBodyMarks = createCoupleApiCall<{ marks: BodyMark[] }, { success: boolean }>('body-marks', 'PUT');
export const generateTandemJournalPrompt = createCoupleApiCall<{}, { success: boolean }>('tandem-journal/prompt');
export const saveTandemAnswer = createCoupleApiCall<{ partner: 'partner1' | 'partner2', answer: string }, { success: boolean }>('tandem-journal/answer');
export const recordFeedback = createCoupleApiCall<{ category: PreferenceCategory, value: string, feedback: Feedback }, { success: boolean }>('feedback');
export const addKey = createCoupleApiCall<{}, { success: boolean }>('add-key');
export const useKey = createCoupleApiCall<{}, { success: boolean }>('use-key');
export const updateAiPreferences = createCoupleApiCall<{ preferences: AiPreferences }, { success: boolean }>('ai-preferences', 'PUT');
export const updateWeeklyMission = createCoupleApiCall<{ mission: WeeklyMission }, { success: boolean }>('weekly-mission', 'PUT');
export const updateRealWorldAdventure = createCoupleApiCall<{ adventure: RealWorldAdventure }, { success: boolean }>('real-world-adventure', 'PUT');
export const updatePassionCompassScores = createCoupleApiCall<{ scores: PassionCompassScores }, { success: boolean }>('passion-compass/scores', 'PUT');
export const updatePassionCompassDailySpark = createCoupleApiCall<{ dailySpark: DailySpark }, { success: boolean }>('passion-compass/daily-spark', 'PUT');
export const updateChatMessages = createCoupleApiCall<{ messages: ChatMessage[] }, { success: boolean }>('chat-messages', 'PUT');
export const addIntimateChronicle = createCoupleApiCall<{ chronicle: IntimateChronicle }, { success: boolean }>('intimate-chronicles');
export const deleteIntimateChronicle = (coupleId: string, chronicleId: string) => fetchFromApi(`/api/couples/${coupleId}/intimate-chronicles/${chronicleId}`, { method: 'DELETE' });
export const addPassionStamp = createCoupleApiCall<{ stamp: PassionStamp }, { success: boolean }>('passion-stamps');
export const deletePassionStamp = (coupleId: string, stampId: string) => fetchFromApi(`/api/couples/${coupleId}/passion-stamps/${stampId}`, { method: 'DELETE' });
export const addTandemEntry = createCoupleApiCall<{ entry: TandemEntry }, { success: boolean }>('tandem-entries');
export const deleteTandemEntry = (coupleId: string, entryId: string) => fetchFromApi(`/api/couples/${coupleId}/tandem-entries/${entryId}`, { method: 'DELETE' });

// --- Obtener Listas de Datos (GET) ---
const createCoupleGetApiCall = <TResponse>(endpoint: string) =>
    (coupleId: string, type?: string): Promise<TResponse> => {
        const url = type ? `/api/couples/${coupleId}/${endpoint}/${type}` : `/api/couples/${coupleId}/${endpoint}`;
        return fetchFromApi<TResponse>(url);
    };

export const getCoupleChallenges = createCoupleGetApiCall<CoupleChallenge[]>('challenges');
export const getCoupleIcebreakerQuestions = createCoupleGetApiCall<IcebreakerQuestion[]>('icebreaker-questions');
export const getCoupleRoleplayScenarios = createCoupleGetApiCall<RoleplayScenario[]>('roleplay-scenarios');
export const getCoupleDateIdeas = createCoupleGetApiCall<DateIdea[]>('date-ideas');
export const getCoupleGameChallenges = createCoupleGetApiCall<GameChallenge[]>('game-challenges');
export const getCoupleIntimateRituals = createCoupleGetApiCall<IntimateRitual[]>('intimate-rituals');
export const getCoupleWeeklyMissions = createCoupleGetApiCall<WeeklyMission[]>('weekly-missions');
export const getCoupleRealWorldAdventures = createCoupleGetApiCall<RealWorldAdventure[]>('real-world-adventures');
export const getCoupleIntimateChronicles = createCoupleGetApiCall<IntimateChronicle[]>('intimate-chronicles');
export const getCouplePassionStamps = createCoupleGetApiCall<PassionStamp[]>('passion-stamps');
export const getCoupleTandemEntries = createCoupleGetApiCall<TandemEntry[]>('tandem-entries');
export const getCoupleFeedback = createCoupleGetApiCall<Feedback[]>('feedback');
export const getCoupleBodyMarks = createCoupleGetApiCall<BodyMark[]>('body-marks');
export const getCoupleStamps = createCoupleGetApiCall<StampData[]>('stamps');
export const getCoupleWishes = createCoupleGetApiCall<Wish[]>('wishes');
export const getCoupleAiPreferences = createCoupleGetApiCall<AiPreferences>('ai-preferences');
export const getCoupleWeeklyMission = createCoupleGetApiCall<WeeklyMission>('weekly-mission');
export const getCoupleRealWorldAdventure = createCoupleGetApiCall<RealWorldAdventure>('real-world-adventure');
export const getCouplePassionCompassScores = createCoupleGetApiCall<PassionCompassScores>('passion-compass/scores');
export const getCoupleDailySpark = createCoupleGetApiCall<DailySpark>('passion-compass/daily-spark');
export const getCoupleChatMessages = createCoupleGetApiCall<ChatMessage[]>('chat-messages');

// --- Obtener Datos Específicos por ID (GET) ---
export const getCoupleIntimateChronicle = (coupleId: string, chronicleId: string) => fetchFromApi<IntimateChronicle>(`/api/couples/${coupleId}/intimate-chronicles/${chronicleId}`);
export const getCouplePassionStamp = (coupleId: string, stampId: string) => fetchFromApi<PassionStamp>(`/api/couples/${coupleId}/passion-stamps/${stampId}`);
export const getCoupleTandemEntry = (coupleId: string, entryId: string) => fetchFromApi<TandemEntry>(`/api/couples/${coupleId}/tandem-entries/${entryId}`);

// --- Función que Rompía el Build (AHORA CORREGIDA) ---
export const generateCouplesIntimateChemistry = (coupleId: string, params: StoryParams): Promise<GeneratedStory> =>
    fetchFromApi(`/api/couples/${coupleId}/intimate-chemistry`, {
        method: 'POST',
        body: JSON.stringify({ params })
    });

// Puedes añadir más funciones aquí si lo necesitas, siguiendo los patrones anteriores.
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
