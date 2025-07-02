import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import short from 'short-uuid';
import { 
    GoogleGenerativeAI, 
    HarmCategory, 
    HarmBlockThreshold,
    Content,
    GenerateContentResponse 
} from "@google/generative-ai";

// --- Basic Setup ---
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- In-Memory Storage ---
interface CoupleSession {
    id: string;
    users: string[];
    sharedData: any;
    clients: Response[]; // For SSE
}
const coupleSessions: Record<string, CoupleSession> = {};
const pairingCodes: Record<string, string> = {};

// --- Gemini API Setup ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("FATAL ERROR: API_KEY for Gemini is not defined in environment variables");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Helper Functions ---
const sendUpdateToCouple = (coupleId: string) => {
    const session = coupleSessions[coupleId];
    if (session && session.clients) {
        const dataToSend = { ...session };
        delete (dataToSend as any).clients; 
        session.clients.forEach(client => 
            client.write(`data: ${JSON.stringify({ type: 'update', data: dataToSend })}\n\n`)
        );
    }
};

// --- API Routes ---

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create a new couple session
app.post('/api/couples', (req: Request, res: Response) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    
    coupleSessions[coupleId] = {
        id: coupleId,
        users: [],
        sharedData: { stamps: [], wishes: [], bodyMarks: [], journal: { entries: [] }, keys: 0, sexDice: { actions: [], bodyParts: [] } },
        clients: [],
    };
    pairingCodes[pairingCode] = coupleId;

    console.log(`Session created: ${coupleId} with code ${pairingCode}`);
    res.status(201).json({ coupleId, pairingCode });
});

// Join a couple session
app.post('/api/couples/join', (req: Request, res: Response) => {
    const { code } = req.body;
    if (typeof code !== 'string' || !pairingCodes[code]) {
        return res.status(404).json({ message: 'Código de emparejamiento no válido o expirado.' });
    }
    const coupleId = pairingCodes[code];
    // More robust check in case the session was cleared but the code wasn't
    if (!coupleSessions[coupleId]) {
        delete pairingCodes[code];
        return res.status(404).json({ message: 'La sesión asociada ha expirado. Por favor, crea una nueva.' });
    }
    const coupleData = coupleSessions[coupleId];
    delete pairingCodes[code];
    res.json({ coupleId, coupleData });
});

// Get session data
app.get('/api/couples/:coupleId', (req: Request, res: Response) => {
    const { coupleId } = req.params;
    if (typeof coupleId !== 'string' || !coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }
    const coupleData = { ...coupleSessions[coupleId] };
    delete (coupleData as any).clients;
    res.json(coupleData);
});

// Server-Sent Events (SSE) endpoint
app.get('/api/couples/:coupleId/events', (req, res) => {
    const { coupleId } = req.params;
    if (!coupleSessions[coupleId]) {
        console.log(`SSE connection denied for non-existent session: ${coupleId}`);
        return res.status(404).end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const session = coupleSessions[coupleId];
    session.clients.push(res);
    console.log(`Client connected for SSE on couple ${coupleId}. Total clients: ${session.clients.length}`);

    req.on('close', () => {
        session.clients = session.clients.filter(client => client !== res);
        console.log(`Client disconnected for SSE on couple ${coupleId}. Total clients: ${session.clients.length}`);
    });
});

// Generic AI interaction
async function fetchFromApi(prompt: string, coupleData: any): Promise<any> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const fullPrompt = `Contexto de la pareja: ${JSON.stringify(coupleData.sharedData)}\n\nTarea: ${prompt}`;
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const candidate = response.candidates?.[0];

        if (!candidate?.content?.parts?.[0]?.text) {
            throw new Error("Invalid response structure from AI");
        }
        const text = candidate.content.parts[0].text;
        try {
            return JSON.parse(text);
        } catch (e) {
            return { text };
        }
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        throw new Error("Failed to get response from AI");
    }
}

// Example AI-powered route
app.post('/api/couples/:coupleId/generate-story', async (req: Request, res: Response) => {
    const { coupleId } = req.params;
    const { params } = req.body;
    if (!coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }
    const prompt = `Genera una historia erótica corta con los siguientes parámetros: ${JSON.stringify(params)}`;
    try {
        const story = await fetchFromApi(prompt, coupleSessions[coupleId]);
        res.json(story);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- Static File Serving & Final Setup ---

// Serve the React frontend
app.use(express.static(path.join(__dirname))); 
// Let React Router handle all other GET requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Error Handling ---
// Global error handler to catch any unhandled errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("UNHANDLED ERROR:", err);
    res.status(500).send('Something broke!');
});
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1); //mandatory (as per the Node.js docs)
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
