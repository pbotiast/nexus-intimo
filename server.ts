// /server.ts - CÓDIGO COMPLETO

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient, User } from '@prisma/client'; // Importar User
import short from 'short-uuid';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Configuración Básica ---
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuración de Gemini ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("ERROR FATAL: La API_KEY para Gemini no está definida.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Middleware de Autenticación Anónima ---
// Este middleware se ejecutará en las rutas protegidas para identificar al usuario.
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
        return res.status(401).json({ message: 'User ID header (x-user-id) is missing.' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(403).json({ message: 'Invalid User ID.' });
        }
        res.locals.user = user; // Adjuntamos el objeto de usuario completo a la respuesta
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error authenticating user.' });
    }
};

// --- RUTAS DE LA API ---

// 1. Inicialización de Usuario Anónimo
app.post('/api/users/init', async (req, res) => {
    const { userId } = req.body;
    try {
        if (userId) {
            const existingUser = await prisma.user.findUnique({ where: { id: userId } });
            if (existingUser) {
                return res.json({ userId: existingUser.id, coupleId: existingUser.coupleId, isNew: false });
            }
        }
        const newUser = await prisma.user.create({ data: {} });
        res.status(201).json({ userId: newUser.id, coupleId: null, isNew: true });
    } catch (error) {
        res.status(500).json({ message: "Error initializing user." });
    }
});

// 2. Crear un Código de Invitación
app.post('/api/couples/invite', authenticateUser, async (req, res) => {
    const user: User = res.locals.user;
    if (user.coupleId) {
        return res.status(400).json({ message: 'Ya perteneces a una pareja.' });
    }

    try {
        const code = short.generate().substring(0, 6).toUpperCase();
        const invitation = await prisma.invitation.create({
            data: { code, inviterId: user.id },
        });
        res.status(201).json({ invitationCode: invitation.code });
    } catch (error) {
        res.status(500).json({ message: "Error creating invitation." });
    }
});

// 3. Aceptar una Invitación para formar una Pareja
app.post('/api/couples/accept', authenticateUser, async (req, res) => {
    const { invitationCode } = req.body;
    const acceptingUser: User = res.locals.user;

    if (acceptingUser.coupleId) {
        return res.status(400).json({ message: 'Ya perteneces a una pareja.' });
    }
    if (!invitationCode || typeof invitationCode !== 'string') {
        return res.status(400).json({ message: 'Código de invitación no válido.' });
    }

    try {
        const invitation = await prisma.invitation.findUnique({ where: { code: invitationCode } });
        if (!invitation) {
            return res.status(404).json({ message: 'Código de invitación no válido o expirado.' });
        }
        
        if (invitation.inviterId === acceptingUser.id) {
            return res.status(400).json({ message: 'No puedes aceptar tu propia invitación.' });
        }

        const inviter = await prisma.user.findUnique({ where: { id: invitation.inviterId } });
        if (!inviter || inviter.coupleId) {
            return res.status(400).json({ message: 'El usuario que te invitó ya no es válido.' });
        }

        const newCouple = await prisma.couple.create({
            data: {
                sharedData: { stamps: [], wishes: [], bodyMarks: [], tandemEntry: null, keys: 0, sexDice: { actions: [], bodyParts: [] }, aiPreferences: {}, weeklyMission: null },
                users: { connect: [{ id: inviter.id }, { id: acceptingUser.id }] }
            }
        });

        await prisma.invitation.delete({ where: { id: invitation.id } });
        res.json({ message: '¡Emparejamiento exitoso!', coupleId: newCouple.id });
    } catch (error) {
        res.status(500).json({ message: "Error accepting invitation." });
    }
});

// 4. Obtener los Datos Compartidos de la Pareja
app.get('/api/couples/data', authenticateUser, async (req, res) => {
    const user: User = res.locals.user;
    if (!user.coupleId) {
        return res.status(404).json({ message: 'No estás en una pareja.' });
    }
    
    try {
        const couple = await prisma.couple.findUnique({ where: { id: user.coupleId } });
        if (!couple) {
            return res.status(404).json({ message: 'No se encontraron los datos de la pareja.' });
        }
        res.json(couple.sharedData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching couple data." });
    }
});

// 5. Ejemplo de una ruta de IA protegida
app.post('/api/couples/story', authenticateUser, async (req, res) => {
    const user: User = res.locals.user;
    if (!user.coupleId) {
        return res.status(403).json({ message: 'Debes estar en una pareja para usar esta función.' });
    }
    const { params } = req.body;
    const prompt = `Genera una historia erótica en español. Formato JSON: {"title": "string", "content": ["párrafo 1"]}. Parámetros: Tema: ${params.theme}, Intensidad: ${params.intensity}, Longitud: ${params.length}, Protagonistas: ${params.protagonists}.`;
    
    // Aquí puedes usar una función genérica si lo deseas
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json\n|```/g, '').trim();
        res.json(JSON.parse(cleanedText));
    } catch (error) {
        res.status(500).json({ message: 'Error generando la historia.' });
    }
});

// --- SERVIR ARCHIVOS ESTÁTICOS Y CIERRE ---

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// --- Manejador de errores final ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("UNHANDLED ERROR:", err);
    res.status(500).send('Something went wrong on the server!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
