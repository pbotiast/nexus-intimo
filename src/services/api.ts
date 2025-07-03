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
    
// This is a sample of how other functions would look. 
// You should create the corresponding endpoints in your server.ts file.

export const generatePersonalChallenge = (coupleId: string): Promise<PersonalChallenge> =>
    fetchFromApi(`/couples/${coupleId}/generate-personal-challenge`, { method: 'POST' });

export const generateCouplesChallenges = (coupleId: string): Promise<PersonalChallenge[]> =>
    fetchFromApi(`/couples/${coupleId}/generate-couples-challenges`, { method: 'POST' });

// You would continue this pattern for all your other API functions...
// For example:
export const addStamp = (coupleId: string, stampData: StampData): Promise<{ success: boolean }> =>
    fetchFromApi(`/couples/${coupleId}/stamps`, { method: 'POST', body: JSON.stringify(stampData) });

export const deleteStamp = (coupleId: string, stampId: string): Promise<void> =>
    fetchFromApi(`/couples/${coupleId}/stamps/${stampId}`, { method: 'DELETE' });

// ... and so on for all the other functions defined in your CoupleContext
// (addWish, revealWish, updateBodyMarks, etc.)

// NOTE: The code above is a template. You need to implement the corresponding
// backend routes in `server.ts` for each function you want to use.
// The `generate-story` endpoint is already implemented in the server as a reference.
