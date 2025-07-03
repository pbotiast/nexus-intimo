// server.ts - VERSIÓN FINAL CON LAS ÚLTIMAS CORRECCIONES PARA PASAR LA COMPILACIÓN

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
        aiPreferences: any; 
        weeklyMission: { mission: any, weekNumber: number, claimed: boolean } | null;
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

    // CORRECCIÓN FINAL PARA TS2538
    if (typeof code !== 'string') {
        return res.status(400).json({ message: 'Código no proporcionado o en formato incorrecto.' });
    }
    
    // Obtener el ID de forma segura para que TypeScript no se queje
    const coupleId = pairingCodes[code]; // Esto puede ser string o undefined
    
    if (!coupleId) { // Comprobamos explícitamente si es undefined
        return res.status(404).json({ message: 'Código no válido o expirado.' });
    }
    
    // A partir de aquí, TypeScript sabe que coupleId es una string
    const session = coupleSessions[coupleId]; 
    if (!session) {
        return res.status(404).json({ message: 'La sesión asociada al código ya no existe.' });
    }

    delete pairingCodes[code]; 
    res.json({ coupleId: coupleId, coupleData: session.sharedData });
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
app.post('/api/couples/:coupleId/journal/prompt', getSession, async (req, res) => {
    const prompt = `Genera una pregunta profunda para que una pareja la responda en un diario compartido. Formato JSON: {"prompt": "string"}`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // CORRECCIÓN FINAL PARA TS2538 en jsonResponse.prompt
        if (typeof jsonResponse.prompt !== 'string') {
            throw new Error("La respuesta de la IA no contiene un 'prompt' válido.");
        }

        res.locals.session.sharedData.tandemEntry = { 
            id: new Date().toISOString(), 
            prompt: jsonResponse.prompt, 
            answer1: null, 
            answer2: null 
        };
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } catch (e) {
        console.error("Error al generar pregunta del diario:", e);
        res.status(500).json({ message: "Error al generar pregunta." });
    }
});

// --- RUTAS DE GESTIÓN DE DATOS (SIN IA) ---

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

app.post('/api/couples/:coupleId/weekly-mission', getSession, async (req, res) => {
    const prompt = `Genera una misión semanal para una pareja. Formato JSON: {"title": "string", "steps": [{"title": "string", "description": "string", "type": "string"}]}.`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const mission = JSON.parse(cleanedText);

        // CORRECCIÓN PARA TS2351: Quitado el 'new' duplicado
        if (typeof mission !== 'object' || mission === null || typeof mission.title !== 'string' || !Array.isArray(mission.steps)) {
            throw new Error("Formato de misión semanal inesperado de la IA.");
        }

        const currentWeek = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (86400000 * 7));

        res.locals.session.sharedData.weeklyMission = {
            mission: mission,
            weekNumber: currentWeek,
            claimed: false
        };
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } catch (e) {
        console.error("Error al generar la misión semanal:", e);
        res.status(500).json({ message: "Error al generar la misión semanal." });
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