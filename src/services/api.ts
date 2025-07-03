// --- Constantes y Tipos ---

// La URL base de tu API. Cámbiala si es necesario.
const API_BASE_URL = 'https://nexus-intimo-api.onrender.com';

// La clave que usaremos para guardar el ID en localStorage.
const USER_ID_STORAGE_KEY = 'nexusIntimoUserId';

// Tipos para que TypeScript te ayude (puedes expandirlos)
interface CoupleData {
    stamps: any[];
    wishes: any[];
    bodyMarks: any[];
    tandemEntry: any | null;
    keys: number;
    sexDice: { actions: string[]; bodyParts: string[] };
    aiPreferences: any;
    weeklyMission: any | null;
}

interface InitResponse {
    userId: string;
    coupleId: string | null;
    coupleData: CoupleData | null;
}

// --- Función de Inicialización ---

/**
 * Se debe llamar una sola vez cuando la aplicación se carga.
 * Obtiene un ID de usuario del servidor y lo guarda localmente.
 * @returns Los datos iniciales del usuario y su pareja (si existe).
 */
export async function initializeUser(): Promise<InitResponse> {
    const savedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);

    const response = await fetch(`${API_BASE_URL}/api/users/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: savedUserId }),
    });

    if (!response.ok) {
        throw new Error('Could not initialize user session.');
    }

    const data: InitResponse = await response.json();

    // Guardamos el ID definitivo que nos da el servidor
    localStorage.setItem(USER_ID_STORAGE_KEY, data.userId);
    
    console.log('User session initialized. User ID:', data.userId);
    return data;
}


// --- Helper Interno para Peticiones Autenticadas ---

// Obtiene el ID del usuario guardado en el navegador
const getUserId = (): string | null => localStorage.getItem(USER_ID_STORAGE_KEY);

/**
 * Función interna que realiza una petición fetch añadiendo la cabecera 'x-user-id'.
 * No deberías necesitar llamarla directamente desde los componentes.
 */
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const userId = getUserId();
    if (!userId) {
        // Este error indica que initializeUser() no se ha llamado o ha fallado.
        throw new Error("User ID not found. The app needs to be re-initialized.");
    }
    
    // Construye las cabeceras, añadiendo la de autenticación.
    const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId, // ¡La cabecera de autenticación!
        ...options.headers,
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        // Intenta parsear el error del servidor para dar un mensaje más claro.
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Si la respuesta no tiene contenido (ej. un 204 No Content), devolvemos un objeto vacío.
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// --- API de Parejas ---

/**
 * Pide al servidor que genere un nuevo código de invitación.
 */
export const generateInvitation = (): Promise<{ invitationCode: string }> =>
    fetchWithAuth('/api/couples/invite', { method: 'POST' });

/**
 * Envía un código de invitación para unirse a una pareja.
 * @param code El código de invitación.
 */
export const acceptInvitation = (code: string): Promise<{ message: string; coupleData: CoupleData }> =>
    fetchWithAuth('/api/couples/accept', { 
        method: 'POST', 
        body: JSON.stringify({ invitationCode: code })
    });

/**
 * Establece la conexión de Server-Sent Events (SSE) para recibir actualizaciones.
 * Esta función es especial y no usa fetchWithAuth porque maneja un stream.
 */
export const connectToCoupleEvents = (onUpdate: (data: CoupleData) => void): EventSource => {
    const userId = getUserId();
    if (!userId) {
        throw new Error("Cannot connect to events without a User ID.");
    }
    
    // Creamos un nuevo EventSource con el header personalizado (esto es un truco, no es estándar)
    // NOTA: Para que esto funcione, el servidor debe poder leer el header de la petición SSE.
    // Si no funciona, se necesitaría pasar el userId como un query parameter.
    // Por ahora, lo dejamos así para mantener la consistencia.
    const eventSource = new EventSource(`${API_BASE_URL}/api/couples/events?userId=${userId}`);

    eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === 'update') {
            onUpdate(parsedData.data);
        }
    };

    eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
    };

    return eventSource;
};


// --- API de Datos y Generación AI ---

// Ejemplo para generar una historia
export const generateStory = (params: { theme: string, intensity: string, length: string, protagonists: string }): Promise<any> =>
    fetchWithAuth('/api/data/story', {
        method: 'POST',
        body: JSON.stringify({ params })
    });

// Ejemplo para añadir un sello
export const addStamp = (stampData: any): Promise<{ success: boolean }> =>
    fetchWithAuth('/api/data/stamps', {
        method: 'POST',
        body: JSON.stringify({ stampData })
    });

// ... Añade aquí el resto de tus funciones de API siguiendo el mismo patrón ...
export const addWish = (wishData: any) => fetchWithAuth('/api/data/wishes', {
    method: 'POST',
    body: JSON.stringify({ wishData })
});
export const generateChallenges = () => fetchWithAuth('/api/data/couples-challenges', {
    method: 'POST'
});
export const getBodyMarks = () => fetchWithAuth('/api/data/body-marks', ...);
export const getTandemEntry = () => fetchWithAuth('/api/data/tandem-entry', ...);
export const getKeys = () => fetchWithAuth('/api/data/keys', ...);
export const getSexDice = () => fetchWithAuth('/api/data/sex-dice', ...);
export const getAISettings = () => fetchWithAuth('/api/data/ai-settings', ...);
export const updateAISettings = (settings: any) => fetchWithAuth('/api/data/ai-settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
    });
export const getWeeklyMission = () => fetchWithAuth('/api/data/weekly-mission', ...);
export const updateWeeklyMission = (mission: any) => fetchWithAuth('/api/data/weekly-mission', {
        method: 'PUT',
        body: JSON.stringify(mission)
    });
export const getCoupleData = () => fetchWithAuth('/api/data/couple-data', ...);
export const updateCoupleData = (data: CoupleData) => fetchWithAuth('/api/data/couple-data', {
        method: 'PUT',
        body: JSON.stringify(data)
    }); 
export const getCoupleProfile = () => fetchWithAuth('/api/data/couple-profile', ...);
export const updateCoupleProfile = (profile: any) => fetchWithAuth('/api/data/couple-profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
    });
export const getCouplePreferences = () => fetchWithAuth('/api/data/couple-preferences', ...);
export const updateCouplePreferences = (preferences: any) => fetchWithAuth('/api/data/couple-preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
    }); 
export const getCoupleStats = () => fetchWithAuth('/api/data/couple-stats', ...);
export const getCoupleHistory = () => fetchWithAuth('/api/data/couple-history', ...);
export const getCoupleNotifications = () => fetchWithAuth('/api/data/couple-notifications', ...);
export const markNotificationAsRead = (notificationId: string) => fetchWithAuth('/api/data/couple-notifications/read', {
        method: 'POST',
        body: JSON.stringify({ notificationId })
    });
export const deleteNotification = (notificationId: string) => fetchWithAuth('/api/data/couple-notifications/delete', {
        method: 'DELETE',
        body: JSON.stringify({ notificationId })
    }); 
export const getCoupleMessages = () => fetchWithAuth('/api/data/couple-messages', ...);
export const sendCoupleMessage = (message: any) => fetchWithAuth('/api/data/couple-messages/send', {
        method: 'POST',
        body: JSON.stringify(message)
    }); 
export const deleteCoupleMessage = (messageId: string) => fetchWithAuth('/api/data/couple-messages/delete', {
        method: 'DELETE',
        body: JSON.stringify({ messageId })
    });
export const getCoupleEvents = () => fetchWithAuth('/api/data/couple-events', ...);
export const createCoupleEvent = (event: any) => fetchWithAuth('/api/data/couple-events/create', {
        method: 'POST',
        body: JSON.stringify(event)
    }); 
export const updateCoupleEvent = (event: any) => fetchWithAuth('/api/data/couple-events/update', {
        method: 'PUT',
        body: JSON.stringify(event)
    });
export const deleteCoupleEvent = (eventId: string) => fetchWithAuth('/api/data/couple-events/delete', {
        method: 'DELETE',
        body: JSON.stringify({ eventId })
    });     
