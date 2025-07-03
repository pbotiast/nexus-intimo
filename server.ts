// server.ts - VERSIÓN FINAL CORREGIDA PARA TYPESCRIPT ESTRICTO

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
    sharedData: any; 
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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        console.log("Enviando prompt a la IA:", prompt.substring(0, 200) + "...");
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
    coupleSessions[coupleId] = { id: coupleId, clients: [], sharedData: { stamps: [], wishes: [], bodyMarks: [], tandemEntry: null, keys: 0, sexDice: { actions: [], bodyParts: [] }, aiPreferences: {}, weeklyMission: null } };
    pairingCodes[pairingCode] = coupleId;
    res.status(201).json({ coupleId, pairingCode });
});

app.post('/api/couples/join', (req, res) => {
    const { code } = req.body;
    // CORRECCIÓN TS2538: Validar que 'code' es una string antes de usarla como índice.
    if (typeof code !== 'string' || !pairingCodes[code]) {
        return res.status(404).json({ message: 'Código no válido o expirado.' });
    }
    const coupleId = pairingCodes[code];
    delete pairingCodes[code];
    res.json({ coupleId, coupleData: coupleSessions[coupleId].sharedData });
});

app.get('/api/couples/:coupleId/data', getSession, (req, res) => {
    res.json(res.locals.session.sharedData);
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

app.post('/api/couples/:coupleId/journal/prompt', getSession, async (req, res) => {
    const prompt = `Genera una pregunta profunda para que una pareja la responda en un diario compartido. Formato JSON: {"prompt": "string"}`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);
        res.locals.session.sharedData.tandemEntry = { id: new Date().toISOString(), prompt: jsonResponse.prompt, answer1: null, answer2: null };
        // CORRECCIÓN TS2345: Usar el `id` de la sesión, que es seguro.
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: "Error al generar pregunta." });
    }
});

// --- RUTAS DE GESTIÓN DE DATOS (SIN IA) ---

app.post('/api/couples/:coupleId/stamps', getSession, (req, res) => {
    const { stampData } = req.body;
    const newStamp = { ...stampData, id: new Date().toISOString(), date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) };
    res.locals.session.sharedData.stamps.push(newStamp);
    // CORRECCIÓN TS2345: Usar el `id` de la sesión, que es seguro.
    sendUpdateToCouple(res.locals.session.id);
    res.status(201).json({ success: true });
});

app.post('/api/couples/:coupleId/wishes', getSession, (req, res) => {
    const { text } = req.body;
    const newWish = { text, id: new Date().toISOString(), author: 'partner1' };
    res.locals.session.sharedData.wishes.push(newWish);
    // CORRECCIÓN TS2345: Usar el `id` de la sesión, que es seguro.
    sendUpdateToCouple(res.locals.session.id);
    res.status(201).json({ success: true });
});

app.post('/api/couples/:coupleId/keys/add', getSession, (req, res) => {
    res.locals.session.sharedData.keys += 1;
    // CORRECCIÓN TS2345: Usar el `id` de la sesión, que es seguro.
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true, keys: res.locals.session.sharedData.keys });
});

app.post('/api/couples/:coupleId/journal/answer', getSession, (req, res) => {
    const { partner, answer } = req.body;
    const entry = res.locals.session.sharedData.tandemEntry;
    // CORRECCIÓN TS2532: Comprobar que `entry` no es nulo antes de usarlo.
    if (entry) {
        if (partner === 'partner1') entry.answer1 = answer;
        if (partner === 'partner2') entry.answer2 = answer;
        // CORRECCIÓN TS2345: Usar el `id` de la sesión, que es seguro.
        sendUpdateToCouple(res.locals.session.id);
    }
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