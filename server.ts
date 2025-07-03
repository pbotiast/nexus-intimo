import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import short from 'short-uuid';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Configuración Básica ---
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Almacenamiento y Tipos ---
interface CoupleSession {
    id: string;
    clients: Response[];
    // CORRECCIÓN: Tipado más específico para sharedData
    sharedData: {
        stamps: any[];
        wishes: any[];
        bodyMarks: any[];
        tandemEntry: { id: string; prompt: string; answer1: string | null; answer2: string | null } | null;
        keys: number;
        sexDice: { actions: string[]; bodyParts: string[] };
        aiPreferences: any; // Considerar tipado más específico si la estructura es conocida
        weeklyMission: { title: string; description: string } | null;
    };
}
const coupleSessions: Record<string, CoupleSession> = {};
const pairingCodes: Record<string, string> = {};

// --- Configuración de Gemini ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("ERROR FATAL: La API_KEY para Gemini no está definida.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
// El modelo ya está correctamente configurado como 'gemini-2.5-flash'.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- Funciones de Ayuda y Middleware ---
const sendUpdateToCouple = (coupleId: string) => {
    const session = coupleSessions[coupleId];
    if (session?.clients) {
        session.clients.forEach(client => 
            client.write(`data: ${JSON.stringify({ type: 'update', data: session.sharedData })}\n\n`)
        );
    }
};

const getSession = (req: Request, res: Response, next: NextFunction) => {
    const session = coupleSessions[req.params.coupleId];
    if (!session) {
        return res.status(404).json({ message: 'Sesión no encontrada o expirada.' });
    }
    res.locals.session = session;
    next();
};

async function generateAndRespond(res: Response, prompt: string) {
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);
        res.json(jsonResponse);
    } catch (error) {
        console.error("Error en la API de Gemini o al parsear JSON:", error);
        res.status(500).json({ message: "No se pudo generar la respuesta de la IA." });
    }
}

// --- RUTAS DE GESTIÓN DE SESIÓN ---

app.post('/api/couples', (req, res) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    coupleSessions[coupleId] = { 
        id: coupleId, 
        clients: [], 
        sharedData: { 
            stamps: [], 
            wishes: [], 
            bodyMarks: [], 
            tandemEntry: null, 
            keys: 0, 
            sexDice: { actions: [], bodyParts: [] }, 
            aiPreferences: {}, 
            weeklyMission: null 
        } 
    };
    pairingCodes[pairingCode] = coupleId;
    res.status(201).json({ coupleId, pairingCode });
});

app.post('/api/couples/join', (req, res) => {
    const { code } = req.body;

    // CORRECCIÓN DEFINITIVA PARA TS2538:
    // 1. Primero, nos aseguramos de que 'code' es una string válida.
    if (typeof code !== 'string') {
        return res.status(400).json({ message: 'Código no proporcionado o en formato incorrecto.' });
    }

    // 2. Ahora que TypeScript sabe que 'code' es una string, podemos usarla como índice.
    const coupleId = pairingCodes[code];
    if (!coupleId) {
        return res.status(404).json({ message: 'Código no válido o expirado.' });
    }
    
    const session = coupleSessions[coupleId];
    if (!session) {
        return res.status(404).json({ message: 'La sesión asociada al código ya no existe.' });
    }

    delete pairingCodes[code];
    res.json({ coupleId, coupleData: session.sharedData });
});

app.get('/api/couples/:coupleId/events', getSession, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.locals.session.clients.push(res);
    req.on('close', () => {
        res.locals.session.clients = res.locals.session.clients.filter((c: Response) => c !== res);
    });
});

// --- RUTAS DE GENERACIÓN POR IA ---

app.post('/api/couples/:coupleId/story', getSession, (req, res) => {
    const { params } = req.body;
    const prompt = `Genera una historia erótica en español. Formato JSON: {"title": "string", "content": ["párrafo 1", "párrafo 2"]}. Parámetros: Tema: ${params.theme}, Intensidad: ${params.intensity}, Longitud: ${params.length}, Protagonistas: ${params.protagonists}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/couples-challenges', getSession, (req, res) => {
    const prompt = `Genera 3 retos para parejas con intensidad gradual (Suave, Picante, Atrevido). Formato JSON: [{"level": "string", "title": "string", "description": "string"}].`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/date-idea', getSession, (req, res) => {
    const { category } = req.body;
    const prompt = `Genera una idea para una cita romántica en español de categoría '${category}'. Formato JSON: {"title": "string", "description": "string", "category": "${category}"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/intimate-ritual', getSession, (req, res) => {
    const { energy } = req.body;
    const prompt = `Crea un ritual íntimo para una pareja con energía '${energy}'. Formato JSON: {"title": "string", "steps": [{"title": "string", "description": "string", "type": "string"}]}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/roleplay-scenario', getSession, (req, res) => {
    const { theme } = req.body;
    const prompt = `Genera un escenario de roleplay sobre '${theme}'. Formato JSON: {"title": "string", "setting": "string", "character1": "string", "character2": "string", "plot": "string"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/weekly-mission', getSession, (req, res) => {
    const { params } = req.body;
    const prompt = `Genera una misión semanal para una pareja. Formato JSON: {"title": "string", "description": "string"}. Parámetros: ${JSON.stringify(params)}.`;
    generateAndRespond(res, prompt);
});

// --- RUTAS DE GESTIÓN DE DATOS (SIN IA) ---

app.post('/api/couples/:coupleId/journal/prompt', getSession, async (req, res) => {
    const prompt = `Genera una pregunta profunda para que una pareja la responda en un diario compartido. Formato JSON: {"prompt": "string"}`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);
        res.locals.session.sharedData.tandemEntry = { id: new Date().toISOString(), prompt: jsonResponse.prompt, answer1: null, answer2: null };
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: "Error al generar pregunta." });
    }
});

app.post('/api/couples/:coupleId/journal/answer', getSession, (req, res) => {
    const { partner, answer } = req.body;
    const entry = res.locals.session.sharedData.tandemEntry;
    
    if (entry) {
        if (partner === 'partner1') entry.answer1 = answer;
        if (partner === 'partner2') entry.answer2 = answer;
        sendUpdateToCouple(res.locals.session.id);
    }
    
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/stamps', getSession, (req, res) => {
    const newStamp = { ...req.body.stampData, id: new Date().toISOString(), date: new Date().toLocaleDateString('es-ES') };
    res.locals.session.sharedData.stamps.push(newStamp);
    sendUpdateToCouple(req.params.coupleId);
    res.status(201).json({ success: true });
});

app.post('/api/couples/:coupleId/wishes', getSession, (req, res) => {
    const newWish = { ...req.body, id: new Date().toISOString() };
    res.locals.session.sharedData.wishes.push(newWish);
    sendUpdateToCouple(req.params.coupleId);
    res.status(201).json({ success: true });
});

app.post('/api/couples/:coupleId/bodyMarks', getSession, (req, res) => {
    const { bodyPart, mark } = req.body;
    const existingMarkIndex = res.locals.session.sharedData.bodyMarks.findIndex((bm: any) => bm.bodyPart === bodyPart);
    if (existingMarkIndex !== -1) {
        res.locals.session.sharedData.bodyMarks[existingMarkIndex].mark = mark;
    } else {
        res.locals.session.sharedData.bodyMarks.push({ bodyPart, mark });
    }
    sendUpdateToCouple(req.params.coupleId);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/tandemJournal', getSession, (req, res) => {
    res.locals.session.sharedData.tandemEntry = req.body.entry;
    sendUpdateToCouple(req.params.coupleId);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/keys', getSession, (req, res) => {
    const { amount } = req.body;
    res.locals.session.sharedData.keys += amount;
    sendUpdateToCouple(req.params.coupleId);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/sexDice', getSession, (req, res) => {
    res.locals.session.sharedData.sexDice = req.body.diceData;
    sendUpdateToCouple(req.params.coupleId);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/aiPreferences', getSession, (req, res) => {
    res.locals.session.sharedData.aiPreferences = req.body.preferences;
    sendUpdateToCouple(req.params.coupleId);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/weeklyMission', getSession, (req, res) => {
    res.locals.session.sharedData.weeklyMission = req.body.mission;
    sendUpdateToCouple(req.params.coupleId);
    res.status(200).json({ success: true });
});


// --- SERVIR ARCHIVOS ESTÁTICOS Y CIERRE ---

app.use(express.static(__dirname));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Manejador de errores final ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("ERROR NO MANEJADO:", err);
    res.status(500).send('¡Algo salió muy mal en el servidor!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
