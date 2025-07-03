// server.ts - VERSIÓN FINAL Y CORREGIDA PARA PASAR LA COMPILACIÓN DE TYPESCRIPT

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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Modelo corregido

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
            stamps: [], wishes: [], bodyMarks: [], tandemEntry: null, 
            keys: 0, sexDice: { actions: [], bodyParts: [] }, 
            aiPreferences: {}, weeklyMission: null 
        } 
    };
    pairingCodes[pairingCode] = coupleId;
    res.status(201).json({ coupleId, pairingCode });
});

app.post('/api/couples/join', (req, res) => {
    const { code } = req.body;

    // CORRECCIÓN DEFINITIVA PARA TS2538 EN pairingCodes[code]
    // Validamos que 'code' es una string Y que existe como propiedad en 'pairingCodes'.
    // Esto asegura a TypeScript que pairingCodes[code] NO será undefined.
    if (typeof code === 'string' && Object.prototype.hasOwnProperty.call(pairingCodes, code)) {
        const coupleId = pairingCodes[code]; // Ahora TypeScript sabe que coupleId es 'string'
        
        const session = coupleSessions[coupleId];
        if (!session) {
            return res.status(404).json({ message: 'La sesión asociada al código ya no existe.' });
        }

        delete pairingCodes[code];
        res.json({ coupleId, coupleData: session.sharedData });
    } else {
        return res.status(404).json({ message: 'Código no válido, expirado o en formato incorrecto.' });
    }
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
    const prompt = `Genera una misión semanal para una pareja. Formato JSON: {"title": "string", "steps": [{"title": "string", "description": "string", "type": "string"}]}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/personal-challenge', getSession, (req, res) => {
    const prompt = `Genera un reto personal de autoexploración sexual o de intimidad. Formato JSON: {"title": "string", "description": "string", "focus": "string"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/icebreaker-question', getSession, (req, res) => {
    const prompt = `Genera una pregunta rompehielos para profundizar la conexión en una pareja. Formato JSON: {"question": "string", "category": "string"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/game-challenge', getSession, (req, res) => {
    const { type } = req.body;
    const prompt = `Genera un desafío para un juego de mesa erótico de tipo '${type}'. Formato JSON: {"type": "${type}", "title": "string", "description": "string"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/intimate-chronicle', getSession, (req, res) => {
    const stampsData = JSON.stringify(res.locals.session.sharedData.stamps);
    const prompt = `Basándote en estos sellos de un pasaporte de pasión: ${stampsData}, genera una crónica íntima para la pareja. Formato JSON: {"title": "string", "content": ["párrafo 1", "párrafo 2"]}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/soul-mirror-reflection', getSession, (req, res) => {
    const { scores } = req.body;
    const prompt = `Basándote en estas puntuaciones de la brújula de la pasión: ${JSON.stringify(scores)}, genera una reflexión poética sobre la conexión de la pareja y sugiere 2-3 invitaciones para explorar más. Formato JSON: {"title": "string", "content": ["párrafo 1"], "invitations": [{"text": "string", "link": "string"}]}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/daily-spark', getSession, (req, res) => {
    const { scores } = req.body; 
    const prompt = `Genera una "chispa diaria" para una pareja, un pequeño reto o idea para conectar hoy. Formato JSON: {"title": "string", "description": "string"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/nexo-chat', getSession, (req, res) => {
    const { messages } = req.body;
    const history = messages.map((m: {role: string, text: string}) => `${m.role}: ${m.text}`).join('\n');
    const prompt = `Eres 'Nexo', un guía de intimidad para parejas. Continúa esta conversación de forma útil y empática:\n${history}\nmodel: \nFormato JSON: {"text": "string"}`;
    generateAndRespond(res, prompt);
});

// --- RUTAS DE GESTIÓN DE DATOS (SIN IA) ---

app.get('/api/couples/:coupleId/data', getSession, (req, res) => {
    res.json(res.locals.session.sharedData);
});

app.post('/api/couples/:coupleId/journal/prompt', getSession, async (req, res) => {
    const prompt = `Genera una pregunta profunda para que una pareja la responda en un diario compartido. Formato JSON: {"prompt": "string"}`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // CORRECCIÓN PARA TS2538 en jsonResponse.prompt (similar al de la línea 114 original)
        if (typeof jsonResponse.prompt !== 'string') {
            throw new Error("La respuesta de la IA para el prompt del diario no es una cadena.");
        }

        res.locals.session.sharedData.tandemEntry = { id: new Date().toISOString(), prompt: jsonResponse.prompt, answer1: null, answer2: null };
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } catch (e) {
        console.error("Error al generar pregunta del diario:", e);
        res.status(500).json({ message: "Error al generar pregunta." });
    }
});

app.post('/api/couples/:coupleId/journal/answer', getSession, (req, res) => {
    const { partner, answer } = req.body;
    const entry = res.locals.session.sharedData.tandemEntry;
    
    if (entry) { // Asegura que tandemEntry no es null
        if (partner === 'partner1') entry.answer1 = answer;
        if (partner === 'partner2') entry.answer2 = answer;
        sendUpdateToCouple(res.locals.session.id);
    }
    
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/stamps', getSession, (req, res) => {
    const newStamp = { ...req.body.stampData, id: new Date().toISOString(), date: new Date().toLocaleDateString('es-ES') };
    res.locals.session.sharedData.stamps.push(newStamp);
    sendUpdateToCouple(res.locals.session.id);
    res.status(201).json({ success: true });
});

app.delete('/api/couples/:coupleId/stamps/:stampId', getSession, (req, res) => {
    const { stampId } = req.params;
    res.locals.session.sharedData.stamps = res.locals.session.sharedData.stamps.filter((s: any) => s.id !== stampId);
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/wishes', getSession, (req, res) => {
    const { text } = req.body;
    const newWish = { text, id: new Date().toISOString(), author: 'partner1' }; // Autor es placeholder
    res.locals.session.sharedData.wishes.push(newWish);
    sendUpdateToCouple(res.locals.session.id);
    res.status(201).json({ success: true });
});

app.post('/api/couples/:coupleId/wishes/reveal', getSession, (req, res) => {
    const wishes = res.locals.session.sharedData.wishes;
    if (wishes.length === 0) {
        return res.status(404).json({ message: 'No hay deseos para revelar.' });
    }
    const randomIndex = Math.floor(Math.random() * wishes.length);
    const revealedWish = wishes.splice(randomIndex, 1)[0]; // Revela y elimina
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json(revealedWish);
});


app.post('/api/couples/:coupleId/body-marks', getSession, (req, res) => {
    // La solicitud del frontend envía un array de marcas, reemplazamos el array completo
    res.locals.session.sharedData.bodyMarks = req.body; 
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/keys/add', getSession, (req, res) => {
    res.locals.session.sharedData.keys += 1;
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true, keys: res.locals.session.sharedData.keys });
});

app.post('/api/couples/:coupleId/keys/use', getSession, (req, res) => {
    if (res.locals.session.sharedData.keys <= 0) {
        return res.status(400).json({ success: false, message: 'No hay llaves disponibles.' });
    }
    res.locals.session.sharedData.keys -= 1;
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true, keys: res.locals.session.sharedData.keys });
});

app.post('/api/couples/:coupleId/sex-dice', getSession, (req, res) => {
    res.locals.session.sharedData.sexDice = req.body; 
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/feedback', getSession, (req, res) => {
    const { category, value, feedback } = req.body;
    const key = `${category}:${value}`;
    // Incrementa la preferencia por el tipo de feedback
    if (res.locals.session.sharedData.aiPreferences[key] === undefined) {
        res.locals.session.sharedData.aiPreferences[key] = 0;
    }
    res.locals.session.sharedData.aiPreferences[key] += (feedback === 'like' ? 1 : -1);
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/weekly-mission', getSession, async (req, res) => {
    // Genera la misión (puedes usar la IA o un generador local)
    const prompt = `Genera una misión semanal para una pareja. Formato JSON: {"title": "string", "steps": [{"title": "string", "description": "string", "type": "string"}]}.`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const mission = JSON.parse(cleanedText);

        const currentWeek = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (86400000 * 7));

        res.locals.session.sharedData.weeklyMission = {
            mission: mission,
            weekNumber: currentWeek,
            claimed: false
        };
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: "Error al generar la misión semanal." });
    }
});

app.post('/api/couples/:coupleId/claim-mission-reward', getSession, (req, res) => {
    const mission = res.locals.session.sharedData.weeklyMission;
    if (mission && !mission.claimed) {
        res.locals.session.sharedData.keys += 1; // Añade una llave
        mission.claimed = true; // Marca como reclamada
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Misión no encontrada o ya reclamada.' });
    }
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
        