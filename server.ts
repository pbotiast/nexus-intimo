

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as crypto from 'crypto';
import short from 'short-uuid';

import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { 
    StoryParams, GeneratedStory, PersonalChallenge, CoupleChallenge, IcebreakerQuestion, RoleplayScenario, 
    DateIdea, GameChallenge, IntimateRitual, RitualEnergy, AiPreferences, WeeklyMission, RealWorldAdventure, 
    PassionStamp, IntimateChronicle, AdventureStyle, SoulReflection, PassionCompassScores, DailySpark, 
    ChatMessage, CoupleData, StoredWeeklyMission, TandemEntry, Wish, BodyMark, StampData, Feedback, PreferenceCategory
} from './types.js';

dotenv.config();

// --- Server Setup ---
const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Default Data ---
const defaultDiceActions = [
    'Besar apasionadamente', 'Lamer lentamente', 'Morder suavemente', 'Chupar con intensidad',
    'Acariciar con la lengua', 'Explorar con los dedos', 'Masajear con aceite', 'Susurrar una fantasía sobre',
    'Desvestir con la boca', 'Dejar una marca de amor', 'Usar un cubito de hielo en', 'Atar suavemente con una prenda'
];
const defaultDiceBodyParts = [
    'Labios', 'Cuello', 'Pezones', 'Pecho', 'Abdomen', 'Nalgas',
    'Entrepierna', 'Clítoris', 'Pene', 'Vagina', 'Testículos', 'Ano'
];

// --- Gemini AI Setup ---
if (!process.env.API_KEY) {
  console.error("CRITICAL: API_KEY environment variable not set. The application will not work.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "INVALID_KEY" });

// --- Simple File-based Database ---
const DB_PATH = path.join(__dirname, 'db.json');
interface AppDatabase {
    couples: Record<string, CoupleData>;
    pairingCodes: Record<string, { coupleId: string; expires: number }>;
}

let db: AppDatabase = { couples: {}, pairingCodes: {} };

const readDb = () => {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf-8');
            db = JSON.parse(data);
        } else {
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        }
    } catch (error) {
        console.error('Error reading database:', error);
    }
};

const writeDb = () => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error writing to database:', error);
    }
};

readDb();
setInterval(() => { // Clean up expired pairing codes every minute
    const now = Date.now();
    let changed = false;
    for (const code in db.pairingCodes) {
        if (db.pairingCodes[code].expires < now) {
            delete db.pairingCodes[code];
            changed = true;
        }
    }
    if (changed) writeDb();
}, 60000);

// --- SSE (Server-Sent Events) Setup for Real-time Updates ---
const clients: Record<string, Response[]> = {};

const broadcastUpdate = (coupleId: string, data: Partial<CoupleData>) => {
    const coupleClients = clients[coupleId];
    if (coupleClients) {
        const payload = JSON.stringify({ type: 'update', data });
        coupleClients.forEach(client => client.write(`data: ${payload}\n\n`));
    }
};

// --- Gemini AI Helper ---
const callGeminiWithRetry = async (
    params: { model: string; contents: any; config?: any; },
    maxRetries = 2
): Promise<GenerateContentResponse> => {
    // ... (retry logic remains the same)
    let retries = 0;
    while(true) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            retries++;
            if (retries > maxRetries || !error.toString().includes('429')) throw error;
            await new Promise(res => setTimeout(res, 1000 * retries));
        }
    }
};

const parseJsonResponse = <T,>(jsonStr: string): T | null => {
    let cleanJsonStr = jsonStr.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonStr.match(fenceRegex);
    if (match && match[2]) {
        cleanJsonStr = match[2].trim();
    }
    try {
        return JSON.parse(cleanJsonStr) as T;
    } catch (e) { console.error("Failed to parse JSON response:", e); return null; }
};

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Couple & Pairing Routes ---
app.post('/api/couples/create', (req: Request, res: Response) => {
    const coupleId = short.generate();
    const pairingCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const newCoupleData: CoupleData = {
        id: coupleId,
        keys: 1,
        stamps: [],
        wishes: [],
        weeklyMission: null,
        bodyMarks: [],
        tandemEntry: null,
        aiPreferences: {},
        sexDice: {
            actions: defaultDiceActions,
            bodyParts: defaultDiceBodyParts,
        }
    };
    db.couples[coupleId] = newCoupleData;
    db.pairingCodes[pairingCode] = { coupleId, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry
    writeDb();
    res.json({ coupleId, pairingCode });
});

app.post('/api/couples/join', (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: 'El código de emparejamiento es requerido y debe ser un texto.' });
    }
    const pairingInfo = db.pairingCodes[code.toUpperCase()];
    if (!pairingInfo || pairingInfo.expires < Date.now()) {
        return res.status(404).json({ message: 'El código de emparejamiento no es válido o ha expirado. Por favor, pide a tu pareja que genere uno nuevo.' });
    }
    const { coupleId } = pairingInfo;
    const coupleData = db.couples[coupleId];
    if (!coupleData) {
        return res.status(404).json({ message: 'No se encontró la sesión de pareja asociada a este código.' });
    }
    delete db.pairingCodes[code.toUpperCase()];
    writeDb();
    res.json({ coupleId, coupleData });
});

app.get('/api/couples/:coupleId', (req: Request, res: Response) => {
    const { coupleId } = req.params;
    const coupleData = db.couples[coupleId];
    if (coupleData) {
        res.json(coupleData);
    } else {
        res.status(404).json({ message: 'Sesión de pareja no encontrada.' });
    }
});

// SSE endpoint
app.get('/api/couples/:coupleId/events', (req: Request, res: Response) => {
    const { coupleId } = req.params;
    if (!db.couples[coupleId]) {
        return res.status(404).end();
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!clients[coupleId]) {
        clients[coupleId] = [];
    }
    clients[coupleId].push(res);

    req.on('close', () => {
        clients[coupleId] = clients[coupleId].filter(c => c !== res);
        if (clients[coupleId].length === 0) {
            delete clients[coupleId];
        }
    });
});

// --- Generic API Handler ---
const createCoupleApiEndpoint = <TBody, TResponse>(
    handler: (coupleData: CoupleData, body: TBody, req: Request) => Promise<[TResponse, Partial<CoupleData> | null]>
) => async (req: Request, res: Response) => {
    try {
        const { coupleId } = req.params;
        const coupleData = db.couples[coupleId];
        if (!coupleData) {
            return res.status(404).json({ message: 'Sesión no encontrada.' });
        }

        const [result, dataUpdate] = await handler(coupleData, req.body, req);
        
        if (dataUpdate) {
            Object.assign(db.couples[coupleId], dataUpdate);
            writeDb();
            broadcastUpdate(coupleId, dataUpdate);
        }

        res.json(result);
    } catch (error: any) {
        console.error("API Endpoint Error:", error);
        res.status(500).json({ message: error.message || 'Ocurrió un error en el servidor.' });
    }
};

const createGeneratorEndpoint = <TBody, TResponse>(
    promptBuilder: (body: TBody, coupleData: CoupleData) => string,
    systemInstruction?: string,
) => createCoupleApiEndpoint(async (coupleData, body: TBody, _req: Request): Promise<[TResponse | null, null]> => {
    const prompt = promptBuilder(body, coupleData);
    const config: any = { systemInstruction, responseMimeType: "application/json" };
    const response = await callGeminiWithRetry({ model: "gemini-2.5-flash-preview-04-17", contents: prompt, config });
    return [parseJsonResponse<TResponse>(response.text), null];
});


// --- Refactored & New API Endpoints ---
app.post('/api/couples/:coupleId/erotic-story', createGeneratorEndpoint<{params: StoryParams}, GeneratedStory>(
    ({params}) => `Por favor, genera una historia erótica corta con estos parámetros: ${JSON.stringify(params)}`,
    'Eres "StoryWeaver AI", un talentoso escritor de narrativa erótica y romántica...'
));
app.post('/api/couples/:coupleId/personal-challenge', createGeneratorEndpoint<{}, PersonalChallenge>(
    () => `Genera un reto de autoexploración sexual para una persona...`, 'Eres un coach de empoderamiento sexual...'
));
app.post('/api/couples/:coupleId/couples-challenges', createGeneratorEndpoint<any, CoupleChallenge[]>(
    () => `Genera una lista de 3 retos sexuales para una pareja, con niveles 'Suave', 'Picante' y 'Atrevido'. La respuesta DEBE ser un array JSON de objetos, no un objeto con una propiedad 'challenges'. El array debe contener 3 objetos.`,
    'Eres un coach de intimidad y creador de juegos para parejas. Siempre respondes con JSON válido.'
));
app.post('/api/couples/:coupleId/icebreaker-question', createGeneratorEndpoint<{}, IcebreakerQuestion>(() => `Genera una pregunta rompehielos para una pareja...`));
app.post('/api/couples/:coupleId/roleplay-scenario', createGeneratorEndpoint<{theme: string}, RoleplayScenario>(({theme}) => `Genera un escenario de juego de roles para una pareja basado en el tema: "${theme}"...`));
app.post('/api/couples/:coupleId/date-idea', createGeneratorEndpoint<{category: string}, DateIdea>(({category}) => `Genera una idea para una cita original en la categoría: "${category}"...`));
app.post('/api/couples/:coupleId/game-challenge', createGeneratorEndpoint<{type: GameChallenge['type']}, GameChallenge>(({type}) => `Genera un desafío de juego del tipo: "${type}"...`));
app.post('/api/couples/:coupleId/intimate-ritual', createGeneratorEndpoint<{energy: RitualEnergy}, IntimateRitual>(({energy}) => `Genera un "Ritual Íntimo" con energía de "${energy}"...`));
app.post('/api/couples/:coupleId/real-world-adventure', createGeneratorEndpoint<{coords?: any, style: AdventureStyle}, RealWorldAdventure>(({coords, style}) => `Genera una "Aventura Espontánea" ${coords ? `cerca de la latitud ${coords.latitude} y longitud ${coords.longitude}` : 'que no dependa de un lugar específico'}, con el siguiente estilo: "${style}". La aventura debe ser realizable en cualquier ciudad.`));
app.post('/api/couples/:coupleId/intimate-chronicle', createGeneratorEndpoint<{}, IntimateChronicle>((body, coupleData) => `Analiza los siguientes hitos de una pareja y escribe una crónica poética sobre su viaje: ${JSON.stringify(coupleData.stamps)}...`));
app.post('/api/couples/:coupleId/soul-mirror-reflection', createGeneratorEndpoint<{scores: PassionCompassScores}, SoulReflection>(({scores}, coupleData) => `Analiza la Brújula de la Pasión ${JSON.stringify(scores)} y el historial de la pareja (${JSON.stringify(coupleData.stamps)}) y genera una reflexión inspiradora...`));
app.post('/api/couples/:coupleId/daily-spark', createGeneratorEndpoint<{scores: PassionCompassScores}, DailySpark>(({scores}, coupleData) => `Genera una "Chispa Diaria" basada en este contexto: ${JSON.stringify(scores)} y sus preferencias ${JSON.stringify(coupleData.aiPreferences)}...`));


// Endpoints that modify state
app.post('/api/couples/:coupleId/weekly-mission', createCoupleApiEndpoint(async (coupleData, body) => {
    const prompt = `Genera una "Misión Íntima Semanal"...`;
    const response = await callGeminiWithRetry({ model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" } });
    const mission = parseJsonResponse<WeeklyMission>(response.text);
    if (!mission) return [{ success: false }, null];
    
    const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    const newMission: StoredWeeklyMission = { mission, weekNumber, claimed: false };
    return [{ success: true }, { weeklyMission: newMission }];
}));

app.post('/api/couples/:coupleId/claim-mission-reward', createCoupleApiEndpoint(async (coupleData, body) => {
    if (coupleData.weeklyMission && !coupleData.weeklyMission.claimed) {
        const newKeys = coupleData.keys + 1;
        const updatedMission = { ...coupleData.weeklyMission, claimed: true };
        return [{ success: true }, { keys: newKeys, weeklyMission: updatedMission }];
    }
    return [{ success: false }, null];
}));

app.post('/api/couples/:coupleId/nexo-chat', createCoupleApiEndpoint(async (coupleData, body: {messages: ChatMessage[]}) => {
    const { messages } = body;
    const { aiPreferences, stamps } = coupleData;
    const systemInstruction = `Eres 'Nexo', el Guía Íntimo... (context: ${JSON.stringify(aiPreferences)}, ${stamps.length} sellos)`;
    const contents: Content[] = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    const response = await callGeminiWithRetry({ model: "gemini-2.5-flash-preview-04-17", contents: contents, config: { systemInstruction } });
    return [{ text: response.text }, null];
}));

app.post('/api/couples/:coupleId/stamps', createCoupleApiEndpoint(async (coupleData, body: {stampData: StampData}) => {
    const { stampData } = body;
    const newStamp: PassionStamp = {
        id: short.generate(),
        date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
        category: stampData.category || 'Cita Memorable',
        title: stampData.title || '',
        notes: stampData.notes || '',
    };
    const stamps = [...coupleData.stamps, newStamp];
    return [{ success: true }, { stamps }];
}));

app.delete('/api/couples/:coupleId/stamps/:stampId', createCoupleApiEndpoint(async (coupleData, body, req) => {
    const { stampId } = req.params;
    const stamps = coupleData.stamps.filter(s => s.id !== stampId);
    return [{ success: true }, { stamps }];
}));

app.post('/api/couples/:coupleId/wishes', createCoupleApiEndpoint(async (coupleData, body: {text: string}) => {
    const trimmedText = body.text ? body.text.trim() : '';
    if (!trimmedText) {
        throw new Error("El texto del deseo no puede estar vacío.");
    }
    const newWish: Wish = { id: short.generate(), text: trimmedText, author: 'partner1' };
    const wishes = [...coupleData.wishes, newWish];
    return [{ success: true }, { wishes }];
}));

app.post('/api/couples/:coupleId/wishes/reveal', createCoupleApiEndpoint(async (coupleData, body) => {
    if (coupleData.keys > 0 && coupleData.wishes.length > 0) {
        const randomIndex = Math.floor(Math.random() * coupleData.wishes.length);
        const revealedWish = coupleData.wishes[randomIndex];
        const wishes = coupleData.wishes.filter(w => w.id !== revealedWish.id);
        const keys = coupleData.keys - 1;
        return [revealedWish, { wishes, keys }];
    }
    return [null, null];
}));

app.put('/api/couples/:coupleId/body-marks', createCoupleApiEndpoint(async (coupleData, body: {marks: BodyMark[]}) => {
    return [{ success: true }, { bodyMarks: body.marks }];
}));

app.put('/api/couples/:coupleId/sex-dice', createCoupleApiEndpoint(async (coupleData, body: { actions: string[], bodyParts: string[] }) => {
    if (!body || !Array.isArray(body.actions) || !Array.isArray(body.bodyParts)) {
        throw new Error('Datos inválidos para los dados.');
    }
    const sexDice = {
        actions: body.actions.map(s => String(s).trim()).filter(Boolean),
        bodyParts: body.bodyParts.map(s => String(s).trim()).filter(Boolean),
    };
    return [{ success: true }, { sexDice }];
}));

app.post('/api/couples/:coupleId/tandem-journal/prompt', createCoupleApiEndpoint(async (coupleData, body) => {
    const prompt = `Genera UNA pregunta para un diario de pareja compartido...`;
    const response = await callGeminiWithRetry({ model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" } });
    const promptData = parseJsonResponse<{prompt: string}>(response.text);
    if (!promptData) return [{ success: false }, null];

    const tandemEntry: TandemEntry = { id: short.generate(), prompt: promptData.prompt, answer1: null, answer2: null };
    return [{ success: true }, { tandemEntry }];
}));

app.post('/api/couples/:coupleId/tandem-journal/answer', createCoupleApiEndpoint(async (coupleData, body: {partner: 'partner1' | 'partner2', answer: string}) => {
    if (!coupleData.tandemEntry) return [{ success: false }, null];
    const { partner, answer } = body;
    const updatedEntry = { ...coupleData.tandemEntry, [partner === 'partner1' ? 'answer1' : 'answer2']: answer };
    return [{ success: true }, { tandemEntry: updatedEntry }];
}));

app.post('/api/couples/:coupleId/feedback', createCoupleApiEndpoint(async (coupleData, body: { category: PreferenceCategory, value: string, feedback: Feedback }) => {
    const { category, value, feedback } = body;
    const key = `${category}:${value}`;
    const score = feedback === 'like' ? 1 : -1;
    const aiPreferences = { ...coupleData.aiPreferences };
    aiPreferences[key] = (aiPreferences[key] || 0) + score;
    return [{ success: true }, { aiPreferences }];
}));

app.post('/api/couples/:coupleId/add-key', createCoupleApiEndpoint(async (coupleData) => {
    return [{success: true}, {keys: coupleData.keys + 1}];
}));

app.post('/api/couples/:coupleId/use-key', createCoupleApiEndpoint(async (coupleData) => {
    if (coupleData.keys > 0) {
        return [{success: true}, {keys: coupleData.keys - 1}];
    }
    return [{success: false}, null];
}));


// --- Serve Static Frontend ---
const staticDistPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(staticDistPath));
app.get('*', (req: Request, res: Response) => res.sendFile(path.resolve(staticDistPath, 'index.html')));

app.listen(port, () => {
    console.log(`Nexus Íntimo server listening on port ${port}`);
});