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
    Content, // <-- Tipo añadido
    GenerateContentResponse // <-- Tipo añadido
} from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname))); // Sirve desde la raíz de 'dist'

// Almacenamiento en memoria para las sesiones de pareja
const coupleSessions: Record<string, any> = {};
const pairingCodes: Record<string, string> = {};

// Configuración de la API de Gemini
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY for Gemini is not defined in environment variables");
}
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Rutas de la API ---

// Crear una nueva sesión de pareja
app.post('/api/couples', (req: Request, res: Response) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    
    coupleSessions[coupleId] = {
        id: coupleId,
        users: [],
        sharedData: {},
        // ... otros datos iniciales
    };
    pairingCodes[pairingCode] = coupleId;

    res.json({ coupleId, pairingCode });
});

// Unirse a una sesión de pareja
app.post('/api/couples/join', (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code || !pairingCodes[code]) {
        return res.status(404).json({ message: 'Código de emparejamiento no válido o expirado.' });
    }
    const coupleId = pairingCodes[code];
    const coupleData = coupleSessions[coupleId];
    // Aquí podrías añadir lógica para añadir un usuario a la sesión
    delete pairingCodes[code]; // El código se usa una sola vez
    res.json({ coupleId, coupleData });
});

// Obtener datos de una sesión
app.get('/api/couples/:coupleId', (req: Request, res: Response) => {
    const { coupleId } = req.params;
    const coupleData = coupleSessions[coupleId];
    if (coupleData) {
        res.json(coupleData);
    } else {
        res.status(404).json({ message: 'Sesión no encontrada.' });
    }
});

// Endpoint genérico para interactuar con la IA
async function fetchFromApi(prompt: string, coupleData: any): Promise<any> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const fullPrompt = `Contexto de la pareja: ${JSON.stringify(coupleData)}\n\nTarea: ${prompt}`;
        const result = await model.generateContent(fullPrompt);
        const response: GenerateContentResponse = result.response;
        const text = response.text();
        // Intenta parsear como JSON, si falla, devuelve el texto plano.
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

// Ejemplo de ruta que usa la IA
app.post('/api/couples/:coupleId/generate-story', async (req: Request, res: Response) => {
    const { coupleId } = req.params;
    const { params } = req.body;
    const coupleData = coupleSessions[coupleId];

    if (!coupleData) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }

    const prompt = `Genera una historia erótica corta con los siguientes parámetros: ${JSON.stringify(params)}`;
    
    try {
        const story = await fetchFromApi(prompt, coupleData);
        res.json(story);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


// Servir la app de React para cualquier otra ruta
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
