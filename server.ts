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

// --- Configuración de Rutas ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Simulación de Base de Datos en Memoria ---
const users: Record<string, any> = {}; // Clave: userId
const couples: Record<string, any> = {}; // Clave: coupleId
const invitationCodes: Record<string, string> = {}; // Clave: código, Valor: coupleId
const sseClients: Record<string, Response> = {}; // Clave: userId

// --- Configuración de Gemini AI ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("ERROR FATAL: La variable de entorno API_KEY para Gemini no está definida.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Middleware de Logging ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// --- Funciones de Ayuda ---
const sendUpdateToCouple = (coupleId: string) => {
    const couple = couples[coupleId];
    if (couple && couple.userIds) {
        const updatePayload = `data: ${JSON.stringify({ type: 'update', data: couple.sharedData })}\n\n`;
        couple.userIds.forEach((userId: string) => {
            const client = sseClients[userId];
            if (client) {
                client.write(updatePayload);
            }
        });
    }
};

async function generateAndRespond(res: Response, prompt: string) {
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);
        res.json(jsonResponse);
    } catch (error) {
        console.error("Error con la API de Gemini o al parsear JSON:", error);
        res.status(500).json({ message: "No se pudo generar la respuesta de la IA." });
    }
}

// --- Middleware de Identificación de Usuario ---
const identifyUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId || !users[userId]) {
        return res.status(401).json({ message: 'Se requiere un ID de usuario válido.' });
    }
    res.locals.user = users[userId];
    next();
};

// --- RUTAS DE USUARIO Y SESIÓN ---

// Inicializa una sesión de usuario. Crea uno nuevo si no existe.
app.post('/api/users/init', (req, res) => {
    let userId = req.body.userId as string;

    // Si el cliente no tiene un userId o el nuestro no es válido, creamos uno nuevo.
    if (!userId || !users[userId]) {
        userId = short.generate();
        users[userId] = {
            id: userId,
            coupleId: null
        };
        console.log(`Nuevo usuario creado: ${userId}`);
    }

    const user = users[userId];
    let coupleData = null;
    if (user.coupleId && couples[user.coupleId]) {
        coupleData = couples[user.coupleId].sharedData;
    }

    res.json({
        userId: user.id,
        coupleId: user.coupleId,
        coupleData: coupleData
    });
});

// --- RUTAS DE PAREJA ---
const coupleRouter = express.Router();
coupleRouter.use(identifyUser); // Protege todas las rutas de pareja

// Genera un código de invitación
coupleRouter.post('/invite', (req, res) => {
    const user = res.locals.user;
    let coupleId = user.coupleId;

    if (!coupleId) {
        coupleId = short.generate();
        user.coupleId = coupleId;
        couples[coupleId] = {
            id: coupleId,
            userIds: [user.id],
            sharedData: { stamps: [], wishes: [], bodyMarks: [], tandemEntry: null, keys: 0, sexDice: { actions: [], bodyParts: [] }, aiPreferences: {}, weeklyMission: null }
        };
    }

    const invitationCode = short.generate().substring(0, 8).toUpperCase();
    invitationCodes[invitationCode] = coupleId;
    
    res.json({ invitationCode });
});

// Acepta una invitación
coupleRouter.post('/accept', (req, res) => {
    const { invitationCode } = req.body;
    const user = res.locals.user;

    if (user.coupleId) {
        return res.status(400).json({ message: "Ya perteneces a una pareja." });
    }

    const coupleId = invitationCodes[invitationCode];
    if (!coupleId || !couples[coupleId]) {
        return res.status(404).json({ message: "Código de invitación no válido o expirado." });
    }

    const couple = couples[coupleId];
    if (couple.userIds.length >= 2) {
        return res.status(400).json({ message: "Esta pareja ya está completa." });
    }

    user.coupleId = coupleId;
    couple.userIds.push(user.id);
    delete invitationCodes[invitationCode];

    res.json({ message: "¡Te has unido a la pareja con éxito!", coupleData: couple.sharedData });
});

// Conexión SSE para actualizaciones en tiempo real
coupleRouter.get('/events', (req, res) => {
    const user = res.locals.user;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    sseClients[user.id] = res;

    req.on('close', () => {
        delete sseClients[user.id];
    });
});

// --- RUTAS DE DATOS Y AI ---
const dataRouter = express.Router();
dataRouter.use(identifyUser);

// Middleware para verificar que el usuario está en una pareja
dataRouter.use((req, res, next) => {
    const user = res.locals.user;
    if (!user.coupleId || !couples[user.coupleId]) {
        return res.status(403).json({ message: "Debes estar en una pareja para realizar esta acción." });
    }
    res.locals.couple = couples[user.coupleId];
    next();
});

dataRouter.post('/story', (req, res) => {
    const params = req.body?.params ?? {};
    const prompt = `Genera una historia erótica en español. Formato JSON: {"title": "string", "content": ["párrafo 1", "párrafo 2"]}. Parámetros: Tema: ${params.theme}, Intensidad: ${params.intensity}, Longitud: ${params.length}, Protagonistas: ${params.protagonists}.`;
    generateAndRespond(res, prompt);
});

dataRouter.post('/stamps', (req, res) => {
    const couple = res.locals.couple;
    const newStamp = { ...req.body.stampData, id: new Date().toISOString(), date: new Date().toLocaleDateString('es-ES') };
    couple.sharedData.stamps.push(newStamp);
    sendUpdateToCouple(couple.id);
    res.status(201).json({ success: true });
});

// ... (Aquí irían el resto de tus rutas de datos como /wishes, /bodyMarks, etc.)

app.use('/api/couples', coupleRouter);
app.use('/api/data', dataRouter);


// --- SERVIR ARCHIVOS ESTÁTICOS Y RUTA COMODÍN ---
console.log(`Sirviendo archivos estáticos desde: ${__dirname}`);
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error al enviar index.html:', err);
            res.status(500).send('No se pudo encontrar el punto de entrada de la aplicación.');
        }
    });
});

// --- Manejador de Errores Final ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("ERROR NO MANEJADO:", err.stack);
    res.status(500).send('¡Algo salió muy mal en el servidor!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
