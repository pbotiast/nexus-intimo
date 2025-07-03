iimport express, { Request, Response, NextFunction } from 'express';
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
} from "@google/generative-ai"; // Importación corregida a @google/generative-ai

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
    users: string[];
    sharedData: any;
    clients: Response[]; // Para SSE
}
const coupleSessions: Record<string, CoupleSession> = {};
const pairingCodes: Record<string, string> = {};

// --- Configuración de la API de Gemini ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("ERROR FATAL: La API_KEY para Gemini no está definida en las variables de entorno");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Funciones de Ayuda ---
const sendUpdateToCouple = (coupleId: string) => {
    if (typeof coupleId !== 'string' || !coupleSessions[coupleId]) {
        return;
    }
    const session = coupleSessions[coupleId];
    if (session && session.clients) {
        // Crea una copia de los datos de la sesión y elimina el array 'clients'
        // para evitar errores de estructura circular durante JSON.stringify para SSE.
        const dataToSend = { ...session };
        delete (dataToSend as any).clients; 
        session.clients.forEach(client => 
            client.write(`data: ${JSON.stringify({ type: 'update', data: dataToSend })}\n\n`)
        );
    }
};

// --- Rutas de la API ---

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/couples', (req: Request, res: Response) => {
    const coupleId = short.generate();
    const pairingCode = short.generate().substring(0, 6).toUpperCase();
    
    coupleSessions[coupleId] = {
        id: coupleId,
        users: [],
        sharedData: { stamps: [], wishes: [], bodyMarks: [], journal: { entries: [] }, keys: 0, sexDice: { actions: [], bodyParts: [] } },
        clients: [], // Inicializa con un array vacío de clientes
    };
    pairingCodes[pairingCode] = coupleId;
    console.log(`Sesión creada: ${coupleId} con código ${pairingCode}`);
    res.status(201).json({ coupleId, pairingCode });
});

app.post('/api/couples/join', (req: Request, res: Response) => {
    const { code } = req.body;
    if (typeof code !== 'string' || !pairingCodes[code]) {
        return res.status(404).json({ message: 'Código de emparejamiento no válido o expirado.' });
    }
    const coupleId = pairingCodes[code];
    if (!coupleSessions[coupleId]) {
        delete pairingCodes[code];
        return res.status(404).json({ message: 'La sesión asociada ha expirado. Por favor, crea una nueva.' });
    }
    
    // Crea una copia de coupleData y elimina el array 'clients'
    // antes de enviarlo en la respuesta JSON para evitar errores de estructura circular.
    const coupleData = { ...coupleSessions[coupleId] };
    delete (coupleData as any).clients; // Convierte a 'any' para permitir la eliminación de la propiedad 'clients'
    
    delete pairingCodes[code]; // Elimina el código de emparejamiento después de unirse con éxito
    res.json({ coupleId, coupleData });
});

app.get('/api/couples/:coupleId', (req: Request, res: Response) => {
    const { coupleId } = req.params;
    if (typeof coupleId !== 'string' || !coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }
    // Crea una copia de los datos de la sesión y elimina el array 'clients'
    // antes de enviarlo en la respuesta JSON.
    const data = { ...coupleSessions[coupleId] };
    delete (data as any).clients;
    res.json(data);
});

app.get('/api/couples/:coupleId/events', (req, res) => {
    const { coupleId } = req.params;
    if (typeof coupleId !== 'string' || !coupleSessions[coupleId]) {
        return res.status(404).end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const session = coupleSessions[coupleId];
    session.clients.push(res);
    req.on('close', () => {
        session.clients = session.clients.filter(client => client !== res);
    });
});

async function fetchFromApi(prompt: string, coupleData: any): Promise<any> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `Contexto de la pareja: ${JSON.stringify(coupleData.sharedData)}\n\nTarea: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const candidate = response.candidates?.[0];

    if (!candidate?.content?.parts?.[0]?.text) {
        throw new Error("Respuesta inválida de la IA");
    }
    const text = candidate.content.parts[0].text;
    try {
        return JSON.parse(text);
    } catch (e) {
        return { text };
    }
}

app.post('/api/couples/:coupleId/*', async (req: Request, res: Response) => {
    const { coupleId } = req.params;
    const route = req.path;

    if (typeof coupleId !== 'string' || !coupleSessions[coupleId]) {
        return res.status(404).json({ message: 'Sesión no encontrada.' });
    }
    
    console.log(`Respuesta simulada para: ${route}`);
    
    if (route.includes('generate')) {
        try {
            const mockPrompt = `Genera una respuesta de ejemplo para la ruta: ${route}`;
            const aiResponse = await fetchFromApi(mockPrompt, coupleSessions[coupleId]);
            return res.json(aiResponse);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
    
    res.json({ message: `Respuesta simulada para ${route}`, success: true });
});


// --- Servir Archivos Estáticos y Configuración Final ---
// Sirve archivos estáticos (JS, CSS, imágenes) desde el directorio 'dist', que es el directorio actual del servidor compilado.
app.use(express.static(__dirname)); 

// Para cualquier otra solicitud GET que no sea una ruta de API, sirve el archivo index.html principal.
// Esto permite que React Router maneje el enrutamiento en el lado del cliente.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Manejo de Errores ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("ERROR NO MANEJADO:", err);
    res.status(500).send('¡Algo salió mal!');
});
process.on('uncaughtException', (err) => {
    console.error('Hubo un error no detectado', err);
    process.exit(1);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
