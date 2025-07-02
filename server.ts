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

// Servir archivos estáticos del frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Sirve la carpeta 'dist' que contiene el frontend compilado
app.use(express.static(path.join(__dirname))); 

// Almacenamiento en memoria
interface CoupleSession {
    id: string;
    users: string[];
    sharedData: any;
}
const coupleSessions: Record<string, CoupleSession> = {};
const pairingCodes: Record<string, string> = {};

// Configuración de la API de Gemini
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY for Gemini is not defined in environment variables");
}
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Rutas de la API ---

app.post('/api/couples', (req: Request, res: Response) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    
    coupleSessions[coupleId] = {
        id: coupleId,
        users: [],
        sharedData: {},
    };
    pairingCodes[pairingCode] = coupleId;

    res.json({ coupleId, pairingCode });
});

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

app.get('/api/couples/:coupleId', (req: Request, res: Response) => {
    const { coupleId } = req.params;

    if (typeof coupleId !== 'string' || !coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }
    const coupleData = coupleSessions[coupleId];
    res.json(coupleData);
});

async function fetchFromApi(prompt: string, coupleData: any): Promise<any> {
    try {
        // --- FINAL FIX: Use an up-to-date model name ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const fullPrompt = `Contexto de la pareja: ${JSON.stringify(coupleData)}\n\nTarea: ${prompt}`;
        const result = await model.generateContent(fullPrompt);
        
        const response = result.response;
        const candidate = response.candidates?.[0];

        // Guard clause to ensure the structure is valid down to the 'parts' array.
        if (!candidate || !candidate.content || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
            throw new Error("Invalid response structure from AI: Missing candidates or parts.");
        }

        const firstPart = candidate.content.parts[0];

        // Final guard to ensure the first part has the text we need.
        if (!firstPart || typeof firstPart.text !== 'string') {
             throw new Error("Invalid response structure from AI: First part has no text.");
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

app.post('/api/couples/:coupleId/generate-story', async (req: Request, res: Response) => {
    const { coupleId } = req.params;
    const { params } = req.body;
    
    if (typeof coupleId !== 'string' || !coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }
    const coupleData = coupleSessions[coupleId];

    const prompt = `Genera una historia erótica corta con los siguientes parámetros: ${JSON.stringify(params)}`;
    
    try {
        const story = await fetchFromApi(prompt, coupleData);
        res.json(story);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Servir la app de React para cualquier otra ruta no-API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
