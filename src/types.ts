// src/types.ts

// Tipos existentes
export type CoupleData = {
    desires?: string[];
    bodyMap?: { [key: string]: string };
    // Añade aquí cualquier otro dato compartido que las parejas puedan tener
    keys?: number; // Ejemplo de un nuevo campo
    message?: string; // Para notificaciones SSE
};

export type SexualPosition = {
    name: string;
    type: 'Intimidad' | 'Placer Clitoriano' | 'Placer Vaginal' | 'Acrobático' | 'Otro';
    description: string;
    imageUrl: string;
};

export type AudioGuide = {
    id: string;
    title: string;
    description: string;
    category: string;
    sourceType: 'audio' | 'youtube';
    sourceUrl: string;
    coverArt: string;
    duration: string;
};

export type PassportStamp = {
    id: string; // UUID
    category: string;
    title: string;
    notes: string;
    timestamp: string; // ISO string
};

export type Notification = {
    id: string;
    message: string;
    timestamp: number;
    read: boolean;
};

export type EmpathyEnginePreferences = {
    aiModel: 'gemini-pro' | 'gemini-1.5-flash';
    temperature: number;
    maxTokens: number;
    // Otros ajustes de IA
};

export type User = {
    uid: string; // Firebase User ID
    email: string | null;
    isAnonymous: boolean;
    // Puedes añadir más campos de perfil si los almacenas en Firebase o en tu DB
};

// Nuevos tipos o actualizaciones para la autenticación
// El modelo Couple en Prisma tendrá estos campos
export type Couple = {
    id: string;
    user1FirebaseUid: string; // UID del primer usuario de Firebase
    user2FirebaseUid: string | null; // UID del segundo usuario de Firebase (puede ser null hasta que se una)
    inviteCode: string;
    sharedData: CoupleData;
    createdAt: Date;
    updatedAt: Date;
};
