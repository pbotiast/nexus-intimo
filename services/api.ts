import { StoryParams, GeneratedStory, PersonalChallenge, CoupleChallenge, IcebreakerQuestion, RoleplayScenario, DateIdea, GameChallenge, IntimateRitual, RitualEnergy, AiPreferences, WeeklyMission, RealWorldAdventure, PassionStamp, IntimateChronicle, AdventureStyle, SoulReflection, PassionCompassScores, DailySpark, ChatMessage, CoupleData, BodyMark, TandemEntry, StampData, PreferenceCategory, Feedback, Wish } from '../types';

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : '';

/**
 * Función genérica para realizar peticiones a la API del backend.
 * Maneja la construcción de la URL, las cabeceras y la gestión de errores.
 * @param endpoint El endpoint de la API al que llamar (ej. '/api/couples/create').
 * @param options Opciones de la petición fetch (método, cuerpo, etc.).
 * @returns La respuesta de la API en formato JSON.
 */
async function fetchFromApi<TResponse>(endpoint: string, options: RequestInit = {}): Promise<TResponse> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido en el servidor.' }));
        throw new Error(errorData.message || 'No se pudo completar la solicitud.');
    }
    // Handle cases with no JSON response body
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return {} as TResponse;
    }
}

// --- Pairing and Session ---

/**
 * Crea una nueva sesión de pareja en el backend.
 * @returns Un objeto con el nuevo `coupleId` y un `pairingCode` para que la pareja se una.
 */
export const createCoupleSession = () => fetchFromApi<{ coupleId: string; pairingCode: string }>('/api/couples/create', { method: 'POST' });

/**
 * Permite a un usuario unirse a una sesión de pareja existente usando un código.
 * @param code El código de emparejamiento.
 * @returns Un objeto con el `coupleId` y los datos completos de la sesión de pareja (`coupleData`).
 */
export const joinCoupleSession = (code: string) => fetchFromApi<{ coupleId: string; coupleData: CoupleData }>('/api/couples/join', { method: 'POST', body: JSON.stringify({ code }) });

/**
 * Obtiene los datos más recientes de una sesión de pareja.
 * @param coupleId El ID de la sesión de pareja.
 * @returns Los datos completos de la sesión de pareja (`coupleData`).
 */
export const getCoupleData = (coupleId: string) => fetchFromApi<CoupleData>(`/api/couples/${coupleId}`);

/**
 * Helper para crear una función de llamada a la API que incluye automáticamente el `coupleId`.
 * @param endpoint El endpoint específico de la acción (ej. 'erotic-story').
 * @param method El método HTTP a utilizar.
 * @returns Una función que toma el `coupleId` y un cuerpo de petición y devuelve la promesa de la API.
 */
const createCoupleApiCall = <TBody, TResponse>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => 
    (coupleId: string, body?: TBody): Promise<TResponse> => {
        const options: RequestInit = { method };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return fetchFromApi<TResponse>(`/api/couples/${coupleId}/${endpoint}`, options);
    };

// --- Generator Functions ---
export const generateEroticStory = createCoupleApiCall<{ params: StoryParams }, GeneratedStory>('erotic-story');
export const generatePersonalChallenge = createCoupleApiCall<{}, PersonalChallenge>('personal-challenge');
export const generateCouplesChallenges = createCoupleApiCall<{}, CoupleChallenge[]>('couples-challenges');
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

// --- State Mutation Functions ---
export const claimMissionReward = createCoupleApiCall<{}, { success: boolean }>('claim-mission-reward');
export const addStamp = createCoupleApiCall<{ stampData: StampData }, { success: boolean }>('stamps');
export const deleteStamp = (coupleId: string, stampId: string) => fetchFromApi(`/api/couples/${coupleId}/stamps/${stampId}`, { method: 'DELETE' });
export const addWish = createCoupleApiCall<{ text: string }, { success: boolean }>('wishes');
export const revealWish = createCoupleApiCall<{}, Wish | null>('wishes/reveal');
export const updateBodyMarks = createCoupleApiCall<{ marks: BodyMark[] }, { success: boolean }>('body-marks', 'PUT');
export const generateTandemJournalPrompt = createCoupleApiCall<{}, { success: boolean }>('tandem-journal/prompt');
export const saveTandemAnswer = createCoupleApiCall<{ partner: 'partner1' | 'partner2', answer: string }, { success: boolean }>('tandem-journal/answer');
export const recordFeedback = createCoupleApiCall<{ category: PreferenceCategory, value: string, feedback: Feedback }, { success: boolean }>('feedback');
export const addKey = createCoupleApiCall<{}, {success: true}>('add-key');
export const useKey = createCoupleApiCall<{}, {success: boolean}>('use-key');