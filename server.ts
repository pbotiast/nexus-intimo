import express, { Request, Response } from 'express';
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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname))); 

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
    throw new Error("API_KEY for Gemini is not defined in environment variables");
}
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Helper Functions ---
const sendUpdateToCouple = (coupleId: string) => {
    const session = coupleSessions[coupleId];
    if (session && session.clients) {
        const dataToSend = { ...session };
        // We don't want to send the clients array to the frontend
        delete (dataToSend as any).clients; 

        session.clients.forEach(client => 
            client.write(`data: ${JSON.stringify({ type: 'update', data: dataToSend })}\n\n`)
        );
    }
};

// --- API Routes ---

// Create a new couple session
app.post('/api/couples', (req: Request, res: Response) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    
    coupleSessions[coupleId] = {
        id: coupleId,
        users: [],
        sharedData: {
            stamps: [],
            wishes: [],
            bodyMarks: [],
            journal: { entries: [] },
            keys: 0,
            sexDice: { actions: [], bodyParts: [] }
        },
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

// Server-Sent Events (SSE) endpoint for real-time updates
app.get('/api/couples/:coupleId/events', (req, res) => {
    const { coupleId } = req.params;
    if (!coupleSessions[coupleId]) {
        return res.status(404).end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const session = coupleSessions[coupleId];
    session.clients.push(res);
    console.log(`Client connected for SSE on couple ${coupleId}`);

    req.on('close', () => {
        session.clients = session.clients.filter(client => client !== res);
        console.log(`Client disconnected for SSE on couple ${coupleId}`);
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

        if (!candidate || !candidate.content || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
            throw new Error("Invalid response structure from AI");
        }
        const firstPart = candidate.content.parts[0];
        if (typeof firstPart.text !== 'string') {
            throw new Error("Invalid response structure from AI: no text found");
        }
        const text = firstPart.text;
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

// --- Catch-all for other features (returning mock data) ---
// This prevents 404s for features not fully implemented on the backend yet.
app.post('/api/couples/:coupleId/*', (req: Request, res: Response) => {
    const { coupleId } = req.params;
    if (!coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }
    console.log(`Mock response for: ${req.path}`);
    // Example: add a key
    if (req.path.includes('add-key')) {
        coupleSessions[coupleId].sharedData.keys += 1;
        sendUpdateToCouple(coupleId);
        return res.json({ success: true, keys: coupleSessions[coupleId].sharedData.keys });
    }
    res.json({ message: `Mock response for ${req.path}`, success: true });
});


// Serve React app for all other GET routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
