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
