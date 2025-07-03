import { CoupleData, StampData, StoryParams, GeneratedStory, PersonalChallenge, RoleplayParams, DateIdeaParams, GameChallengeParams, IntimateRitualParams, Mission, RealWorldAdventureParams, IntimateChronicle, SoulMirrorReflectionParams, DailySparkParams, ChatMessage, Wish, BodyMark, TandemJournalPrompt, TandemAnswer, Feedback, Key, SexDiceData } from '../types';

// Determine the base URL for the API
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001/api'
  : '/api'; // Use a relative path in production

// Helper function for making API requests
async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// --- Session Management ---
export const createCoupleSession = (): Promise<{ coupleId: string; pairingCode: string }> => 
    fetchFromApi('/couples', { method: 'POST' });

export const joinCoupleSession = (code: string): Promise<{ coupleId: string; coupleData: CoupleData }> => 
    fetchFromApi('/couples/join', { method: 'POST', body: JSON.stringify({ code }) });

export const getCoupleData = (coupleId: string): Promise<CoupleData> => 
    fetchFromApi(`/couples/${coupleId}`);

// --- AI Generation Endpoints ---
export const generateEroticStory = (coupleId: string, { params }: { params: StoryParams }): Promise<GeneratedStory> =>
    fetchFromApi(`/couples/${coupleId}/generate-story`, { method: 'POST', body: JSON.stringify({ params }) });
    
export const generatePersonalChallenge = (coupleId: string): Promise<PersonalChallenge> =>
    fetchFromApi(`/couples/${coupleId}/generate-personal-challenge`, { method: 'POST' });

export const generateCouplesChallenges = (coupleId: string): Promise<PersonalChallenge[]> =>
    fetchFromApi(`/couples/${coupleId}/generate-couples-challenges`, { method: 'POST' });

export const generateIcebreakerQuestion = (coupleId: string): Promise<{ question: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-icebreaker`, { method: 'POST' });

export const generateRoleplayScenario = (coupleId: string, params: RoleplayParams): Promise<{ scenario: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-roleplay`, { method: 'POST', body: JSON.stringify(params) });

export const generateDateIdea = (coupleId: string, params: DateIdeaParams): Promise<{ idea: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-date-idea`, { method: 'POST', body: JSON.stringify(params) });

export const generateGameChallenge = (coupleId: string, params: GameChallengeParams): Promise<{ challenge: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-game-challenge`, { method: 'POST', body: JSON.stringify(params) });

export const generateIntimateRitual = (coupleId: string, params: IntimateRitualParams): Promise<{ ritual: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-intimate-ritual`, { method: 'POST', body: JSON.stringify(params) });

export const generateWeeklyMission = (coupleId: string): Promise<Mission> =>
    fetchFromApi(`/couples/${coupleId}/generate-weekly-mission`, { method: 'POST' });

export const claimMissionReward = (coupleId: string): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/claim-mission-reward`, { method: 'POST' });

export const generateRealWorldAdventure = (coupleId: string, params: RealWorldAdventureParams): Promise<{ adventure: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-real-world-adventure`, { method: 'POST', body: JSON.stringify(params) });

export const generateIntimateChronicle = (coupleId: string): Promise<IntimateChronicle> =>
    fetchFromApi(`/couples/${coupleId}/generate-intimate-chronicle`, { method: 'POST' });

export const generateSoulMirrorReflection = (coupleId: string, params: SoulMirrorReflectionParams): Promise<{ reflection: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-soul-mirror-reflection`, { method: 'POST', body: JSON.stringify(params) });

export const generateDailySpark = (coupleId: string, params: DailySparkParams): Promise<{ spark: string }> =>
    fetchFromApi(`/couples/${coupleId}/generate-daily-spark`, { method: 'POST', body: JSON.stringify(params) });

export const continueNexoChat = (coupleId: string, message: ChatMessage): Promise<ChatMessage> =>
    fetchFromApi(`/couples/${coupleId}/nexo-chat`, { method: 'POST', body: JSON.stringify(message) });

// --- Data Management Endpoints ---
export const addStamp = (coupleId: string, stampData: StampData): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/stamps`, { method: 'POST', body: JSON.stringify(stampData) });

export const deleteStamp = (coupleId: string, stampId: string): Promise<void> =>
    fetchFromApi(`/couples/${coupleId}/stamps/${stampId}`, { method: 'DELETE' });

export const addWish = (coupleId: string, wish: Wish): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/wishes`, { method: 'POST', body: JSON.stringify(wish) });

export const revealWish = (coupleId: string): Promise<Wish> =>
    fetchFromApi(`/couples/${coupleId}/wishes/reveal`, { method: 'POST' });

export const updateBodyMarks = (coupleId: string, marks: BodyMark[]): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/body-marks`, { method: 'POST', body: JSON.stringify(marks) });

export const generateTandemJournalPrompt = (coupleId: string): Promise<TandemJournalPrompt> =>
    fetchFromApi(`/couples/${coupleId}/journal/prompt`, { method: 'POST' });

export const saveTandemAnswer = (coupleId: string, answer: TandemAnswer): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/journal/answer`, { method: 'POST', body: JSON.stringify(answer) });

export const recordFeedback = (coupleId: string, feedback: Feedback): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/feedback`, { method: 'POST', body: JSON.stringify(feedback) });

export const addKey = (coupleId: string): Promise<{ success: boolean; keys: number }> =>
    fetchFromApi(`/couples/${coupleId}/keys/add`, { method: 'POST' });

export const useKey = (coupleId: string): Promise<{ success: boolean; keys: number }> =>
    fetchFromApi(`/couples/${coupleId}/keys/use`, { method: 'POST' });

export const updateSexDice = (coupleId: string, diceData: SexDiceData): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/sex-dice`, { method: 'POST', body: JSON.stringify(diceData) });
