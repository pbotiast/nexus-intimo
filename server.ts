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
if (!API_KEY) {
    console.error("FATAL ERROR: The API_KEY for Gemini is not defined in the environment variables.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Logging Middleware ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.path}`);
    next();
});

// --- Helper Functions & Middleware ---
const sendUpdateToCouple = (coupleId: string) => {
    const session = coupleSessions[coupleId];
    if (session?.clients) {
        const updatePayload = `data: ${JSON.stringify({ type: 'update', data: session.sharedData })}\n\n`;
        session.clients.forEach(client => client.write(updatePayload));
    }
};

const getSession = (req: Request, res: Response, next: NextFunction) => {
    const { coupleId } = req.params;
    if (typeof coupleId !== 'string') {
        return res.status(400).json({ message: 'Couple ID is missing or invalid.' });
    }
    const session = coupleSessions[coupleId];
    if (!session) {
        return res.status(404).json({ message: 'Session not found or has expired.' });
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
        console.error("Error with Gemini API or parsing JSON:", error);
        res.status(500).json({ message: "Failed to generate AI response." });
    }
}

// --- API ROUTES ---

// These routes do NOT require an existing session ID in the URL
app.post('/api/couples', (req, res) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    coupleSessions[coupleId] = { 
        id: coupleId, 
        clients: [], 
        sharedData: { stamps: [], wishes: [], bodyMarks: [], tandemEntry: null, keys: 0, sexDice: { actions: [], bodyParts: [] }, aiPreferences: {}, weeklyMission: null } 
    };
    pairingCodes[pairingCode] = coupleId; 
    res.status(201).json({ coupleId, pairingCode });
});

app.post('/api/couples/join', (req, res) => {
    const { code } = req.body;
    if (typeof code === 'string' && Object.prototype.hasOwnProperty.call(pairingCodes, code)) {
        const coupleId = pairingCodes[code];
        if (!coupleId) {
            delete pairingCodes[code];
            return res.status(404).json({ message: 'Could not retrieve session for this code.' });
        }
        const session = coupleSessions[coupleId];
        if (!session) {
            delete pairingCodes[code];
            return res.status(404).json({ message: 'The session for this code has expired.' });
        }
        delete pairingCodes[code];
        res.json({ coupleId, coupleData: session.sharedData });
    } else {
        return res.status(404).json({ message: 'Invalid, expired, or incorrect pairing code.' });
    }
});

// --- REFACTORED: Couple-specific router ---
// This router will handle all routes that have a /:coupleId parameter.
const coupleRouter = express.Router();

// Apply the getSession middleware to all routes in this router.
// This validates the session and attaches it to res.locals for every request.
coupleRouter.use(getSession);

// SSE connection for real-time updates
coupleRouter.get('/events', (req, res) => {
    const session = res.locals.session as CoupleSession;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    session.clients.push(res);
    req.on('close', () => {
        session.clients = session.clients.filter(c => c !== res);
    });
});

// AI Generation Routes
coupleRouter.post('/story', (req, res) => {
    const params = req.body?.params ?? {};
    const prompt = `Genera una historia erótica en español. Formato JSON: {"title": "string", "content": ["párrafo 1", "párrafo 2"]}. Parámetros: Tema: ${params.theme}, Intensidad: ${params.intensity}, Longitud: ${params.length}, Protagonistas: ${params.protagonists}.`;
    generateAndRespond(res, prompt);
});

coupleRouter.post('/couples-challenges', (req, res) => {
    const prompt = `Genera 3 retos para parejas con intensidad gradual (Suave, Picante, Atrevido). Formato JSON: [{"level": "string", "title": "string", "description": "string"}].`;
    generateAndRespond(res, prompt);
});

// Data Management Routes
coupleRouter.post('/stamps', (req, res) => {
    const session = res.locals.session as CoupleSession;
    const newStamp = { ...req.body.stampData, id: new Date().toISOString(), date: new Date().toLocaleDateString('es-ES') };
    session.sharedData.stamps.push(newStamp);
    sendUpdateToCouple(session.id);
    res.status(201).json({ success: true });
});

coupleRouter.post('/wishes', (req, res) => {
    const session = res.locals.session as CoupleSession;
    const newWish = { ...req.body, id: new Date().toISOString() };
    session.sharedData.wishes.push(newWish);
    sendUpdateToCouple(session.id);
    res.status(201).json({ success: true });
});

// Mount the couple-specific router on the main app
app.use('/api/couples/:coupleId', coupleRouter);


// --- STATIC FILE SERVING & FALLBACK ---
// This section MUST come AFTER all your API routes have been defined.
console.log(`Serving static files from: ${__dirname}`);
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log(`Fallback: serving index.html from ${indexPath}`);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Could not find the application entry point.');
        }
    });
});

// --- Final Error Handler ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("UNHANDLED ERROR:", err.stack);
    res.status(500).send('Something went wrong on the server!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});
