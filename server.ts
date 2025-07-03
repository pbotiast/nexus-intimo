// server.ts - CÓDIGO COMPLETAMENTE REVISADO Y CORREGIDO

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

// --- Almacenamiento en Memoria ---
interface CoupleSession {
    id: string;
    clients: Response[];
    sharedData: any; 
}
const coupleSessions: Record<string, CoupleSession> = {};
const pairingCodes: Record<string, string> = {};

// --- Configuración de la API de Gemini ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("ERROR FATAL: La API_KEY para Gemini no está definida.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Funciones de Ayuda ---
const sendUpdateToCouple = (coupleId: string) => {
    const session = coupleSessions[coupleId];
    if (session?.clients) {
        const dataToSend = { ...session.sharedData };
        session.clients.forEach(client => 
            client.write(`data: ${JSON.stringify({ type: 'update', data: dataToSend })}\n\n`)
        );
    }
};

// --- Middleware para obtener y validar la sesión ---
const getSession = (req: Request, res: Response, next: NextFunction) => {
    const { coupleId } = req.params;
    const session = coupleSessions[coupleId];
    if (!session) {
        return res.status(404).json({ message: 'Sesión no encontrada o expirada.' });
    }
    res.locals.session = session;
    next();
};

// --- Rutas de Sesión ---
app.post('/api/couples', (req, res) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    
    coupleSessions[coupleId] = {
        id: coupleId,
        clients: [],
        sharedData: { stamps: [], wishes: [], bodyMarks: [], journal: null, keys: 0, sexDice: { actions: [], bodyParts: [] } },
    };
    pairingCodes[pairingCode] = coupleId;
    console.log(`Sesión creada: ${coupleId} con código ${pairingCode}`);
    res.status(201).json({ coupleId, pairingCode });
});

app.post('/api/couples/join', (req, res) => {
    const { code } = req.body;
    const coupleId = pairingCodes[code];
    if (!coupleId || !coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Código no válido o expirado.' });
    }
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
        res.locals.session.clients = res.locals.session.clients.filter(c => c !== res);
    });
});

// --- NUEVAS RUTAS DE API ESPECÍFICAS ---

// Función genérica para interactuar con la IA y parsear la respuesta
async function generateAndRespond(res: Response, prompt: string) {
    try {
        console.log("Enviando prompt a la IA:", prompt.substring(0, 200) + "...");
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonResponse = JSON.parse(text);
        res.json(jsonResponse);
    } catch (error) {
        console.error("Error en la API de Gemini o al parsear JSON:", error);
        res.status(500).json({ message: "No se pudo generar la respuesta de la IA." });
    }
}

// Ruta para generar historias
app.post('/api/couples/:coupleId/story', getSession, async (req, res) => {
    const { params } = req.body;
    const prompt = `Genera una historia erótica en español. Debe devolver un JSON con el formato: {"title": "string", "content": ["string", "string", ...]}. Parámetros: Tema: ${params.theme}, Intensidad: ${params.intensity}, Longitud: ${params.length}, Protagonistas: ${params.protagonists}.`;
    await generateAndRespond(res, prompt);
});

// Ruta para generar retos de pareja
app.post('/api/couples/:coupleId/couples-challenges', getSession, async (req, res) => {
    const prompt = `Genera 3 retos para parejas con intensidad gradual. Devuelve un JSON con el formato: [{"level": "Suave" | "Picante" | "Atrevido", "title": "string", "description": "string"}].`;
    await generateAndRespond(res, prompt);
});

// Ruta para generar una idea de cita
app.post('/api/couples/:coupleId/date-idea', getSession, async (req, res) => {
    const { category } = req.body;
    const prompt = `Genera una idea para una cita romántica en español de categoría '${category}'. Devuelve un JSON con el formato: {"title": "string", "description": "string", "category": "${category}"}.`;
    await generateAndRespond(res, prompt);
});

// Ruta para generar un ritual íntimo
app.post('/api/couples/:coupleId/intimate-ritual', getSession, async (req, res) => {
    const { energy } = req.body;
    const prompt = `Crea un ritual íntimo para una pareja con energía '${energy}'. Devuelve un JSON con formato: {"title": "string", "steps": [{"title": "string", "description": "string", "type": "string"}]}. Los 'type' válidos son: 'audio_guide', 'couple_challenge', 'position', 'game_dice', 'game_board', 'story', 'conversation', 'custom'.`;
    await generateAndRespond(res, prompt);
});

// Agrega aquí el resto de tus rutas específicas (para retos, preguntas, etc.) siguiendo el mismo patrón.
// ...

// --- Servir Archivos Estáticos y Configuración Final ---
app.use(express.static(__dirname)); 
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Manejo de Errores ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("ERROR NO MANEJADO:", err);
    res.status(500).send('¡Algo salió mal!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
