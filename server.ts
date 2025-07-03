import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import short from 'short-uuid';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Basic Configuration ---
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Path Configuration for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- In-Memory Storage & Types ---
interface CoupleSession {
    id: string;
    clients: Response[]; // For Server-Sent Events (SSE)
    sharedData: {
        stamps: any[];
        wishes: any[];
        bodyMarks: any[];
        tandemEntry: { id: string; prompt: string; answer1: string | null; answer2: string | null } | null;
        keys: number;
        sexDice: { actions: string[]; bodyParts: string[] };
        aiPreferences: any; 
        weeklyMission: { title: string; description: string } | null;
    };
}
// Stores active couple sessions, keyed by coupleId
const coupleSessions: Record<string, CoupleSession> = {};
// Temporarily stores pairing codes, keyed by the code itself
const pairingCodes: Record<string, string> = {};

// --- Gemini AI Configuration ---
const API_KEY = process.env.API_KEY;
// Fail-fast if the API key is not configured
if (!API_KEY) {
    console.error("FATAL ERROR: The API_KEY for Gemini is not defined in the environment variables.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Helper Functions & Middleware ---

/**
 * Sends a data update to all connected clients for a specific couple session via SSE.
 * @param {string} coupleId - The ID of the couple session to update.
 */
const sendUpdateToCouple = (coupleId: string) => {
    const session = coupleSessions[coupleId];
    if (session?.clients) {
        const updatePayload = `data: ${JSON.stringify({ type: 'update', data: session.sharedData })}\n\n`;
        session.clients.forEach(client => client.write(updatePayload));
    }
};

/**
 * Middleware to validate the coupleId and attach the corresponding session to the request.
 */
const getSession = (req: Request, res: Response, next: NextFunction) => {
    const { coupleId } = req.params;

    // Ensure coupleId is a valid string
    if (typeof coupleId !== 'string') {
        return res.status(400).json({ message: 'Couple ID is missing or invalid.' });
    }

    const session = coupleSessions[coupleId];
    if (!session) {
        return res.status(404).json({ message: 'Session not found or has expired.' });
    }

    // Attach the session to res.locals for use in subsequent handlers
    res.locals.session = session;
    next();
};

/**
 * Generates content using the Gemini API and sends it as a JSON response.
 * @param {Response} res - The Express response object.
 * @param {string} prompt - The prompt to send to the AI model.
 */
async function generateAndRespond(res: Response, prompt: string) {
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Clean up potential markdown formatting from the AI response
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);
        res.json(jsonResponse);
    } catch (error) {
        console.error("Error with Gemini API or parsing JSON:", error);
        res.status(500).json({ message: "Failed to generate AI response." });
    }
}

// --- SESSION MANAGEMENT ROUTES ---

// Creates a new couple session and returns a unique ID and a temporary pairing code.
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
    pairingCodes[pairingCode] = coupleId; // Link the pairing code to the new session ID

    res.status(201).json({ coupleId, pairingCode });
});

// Allows a second user to join a session using a pairing code.
app.post('/api/couples/join', (req, res) => {
    const { code } = req.body;

    // Validate the code is a string and exists in our records.
    if (typeof code === 'string' && Object.prototype.hasOwnProperty.call(pairingCodes, code)) {
        const coupleId = pairingCodes[code];

        // FIX: Add an explicit check for coupleId to satisfy TypeScript's static analysis.
        if (!coupleId) {
            delete pairingCodes[code]; // Clean up stale code
            return res.status(404).json({ message: 'Could not retrieve session for this code.' });
        }

        const session = coupleSessions[coupleId];

        if (!session) {
            delete pairingCodes[code]; // Clean up stale code
            return res.status(404).json({ message: 'The session for this code has expired.' });
        }

        delete pairingCodes[code]; // Code is single-use, delete it after successful join.
        res.json({ coupleId, coupleData: session.sharedData });

    } else {
        return res.status(404).json({ message: 'Invalid, expired, or incorrect pairing code.' });
    }
});

// Establishes a Server-Sent Events (SSE) connection for real-time updates.
app.get('/api/couples/:coupleId/events', getSession, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Add the client's response object to the list for this session
    res.locals.session.clients.push(res);

    // Remove the client from the list when the connection is closed
    req.on('close', () => {
        res.locals.session.clients = res.locals.session.clients.filter((c: Response) => c !== res);
    });
});

// --- AI GENERATION ROUTES ---

app.post('/api/couples/:coupleId/story', getSession, (req, res) => {
    // Safely access nested properties from the request body with fallbacks.
    const params = req.body?.params ?? {};
    const theme = params.theme ?? 'un encuentro inesperado';
    const intensity = params.intensity ?? 'media';
    const length = params.length ?? 'corta';
    const protagonists = params.protagonists ?? 'dos amantes';
    const prompt = `Genera una historia erótica en español. Formato JSON: {"title": "string", "content": ["párrafo 1", "párrafo 2"]}. Parámetros: Tema: ${theme}, Intensidad: ${intensity}, Longitud: ${length}, Protagonistas: ${protagonists}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/couples-challenges', getSession, (req, res) => {
    const prompt = `Genera 3 retos para parejas con intensidad gradual (Suave, Picante, Atrevido). Formato JSON: [{"level": "string", "title": "string", "description": "string"}].`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/date-idea', getSession, (req, res) => {
    const category = req.body?.category ?? 'Aventura';
    const prompt = `Genera una idea para una cita romántica en español de categoría '${category}'. Formato JSON: {"title": "string", "description": "string", "category": "${category}"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/intimate-ritual', getSession, (req, res) => {
    const energy = req.body?.energy ?? 'relajante';
    const prompt = `Crea un ritual íntimo para una pareja con energía '${energy}'. Formato JSON: {"title": "string", "steps": [{"title": "string", "description": "string", "type": "string"}]}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/roleplay-scenario', getSession, (req, res) => {
    const theme = req.body?.theme ?? 'fantasía';
    const prompt = `Genera un escenario de roleplay sobre '${theme}'. Formato JSON: {"title": "string", "setting": "string", "character1": "string", "character2": "string", "plot": "string"}.`;
    generateAndRespond(res, prompt);
});

app.post('/api/couples/:coupleId/weekly-mission', getSession, (req, res) => {
    const params = req.body?.params ?? {};
    const paramsString = JSON.stringify(params);
    const prompt = `Genera una misión semanal para una pareja. Formato JSON: {"title": "string", "description": "string"}. Parámetros: ${paramsString}.`;
    generateAndRespond(res, prompt);
});

// --- DATA MANAGEMENT ROUTES (NON-AI) ---

app.post('/api/couples/:coupleId/journal/prompt', getSession, async (req, res) => {
    const prompt = `Genera una pregunta profunda para que una pareja la responda en un diario compartido. Formato JSON: {"prompt": "string"}`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // Set the new journal entry for the session
        res.locals.session.sharedData.tandemEntry = { id: new Date().toISOString(), prompt: jsonResponse.prompt, answer1: null, answer2: null };
        
        // Notify clients of the update
        sendUpdateToCouple(res.locals.session.id);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: "Error generating journal prompt." });
    }
});

app.post('/api/couples/:coupleId/journal/answer', getSession, (req, res) => {
    const { partner, answer } = req.body;
    const entry = res.locals.session.sharedData.tandemEntry;
    
    if (entry) {
        if (partner === 'partner1') entry.answer1 = answer;
        if (partner === 'partner2') entry.answer2 = answer;
        // Notify clients of the update
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

app.post('/api/couples/:coupleId/wishes', getSession, (req, res) => {
    const newWish = { ...req.body, id: new Date().toISOString() };
    res.locals.session.sharedData.wishes.push(newWish);
    sendUpdateToCouple(res.locals.session.id);
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
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/tandemJournal', getSession, (req, res) => {
    res.locals.session.sharedData.tandemEntry = req.body.entry;
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/keys', getSession, (req, res) => {
    const { amount } = req.body;
    if (typeof amount === 'number') {
        res.locals.session.sharedData.keys += amount;
    }
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/sexDice', getSession, (req, res) => {
    res.locals.session.sharedData.sexDice = req.body.diceData;
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/aiPreferences', getSession, (req, res) => {
    res.locals.session.sharedData.aiPreferences = req.body.preferences;
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});

app.post('/api/couples/:coupleId/weeklyMission', getSession, (req, res) => {
    res.locals.session.sharedData.weeklyMission = req.body.mission;
    sendUpdateToCouple(res.locals.session.id);
    res.status(200).json({ success: true });
});


// --- STATIC FILE SERVING & FALLBACK ---

// Serve the built client-side assets
app.use(express.static(path.join(__dirname, '../dist')));

// For any other route, serve the main index.html (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// --- Final Error Handler ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("UNHANDLED ERROR:", err);
    res.status(500).send('Something went wrong on the server!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
