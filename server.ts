// server/src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import bodyParser from 'body-parser';
import { z } from 'zod';
import { CoupleData } from '../src/types'; // Importar el tipo CoupleData

// Asegúrate de que las variables de entorno están cargadas (ej. con dotenv en un entorno real)
// require('dotenv').config(); // Descomentar si usas dotenv

const app = express();
// NOTA CRÍTICA: En producción, Prisma debe conectarse a una base de datos real (PostgreSQL, MySQL, etc.),
// no depender de un archivo local o de la mención de 'db.json' en el README, que es para desarrollo.
const prisma = new PrismaClient();

// Verificación de la API Key al inicio
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: La variable de entorno GEMINI_API_KEY no está definida.");
  process.exit(1); // Salir si la clave no está presente
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(bodyParser.json());

// --- Sistema de Sincronización en Tiempo Real (SSE) ---

// Almacena las conexiones abiertas de los clientes (res) por coupleId
const clients: { [coupleId: string]: Response[] } = {};

// Función para enviar actualizaciones a todos los clientes de una pareja
const sendUpdateToCouple = (coupleId: string, data: CoupleData) => { // Tipado de data
  if (clients[coupleId]) {
    const eventData = `data: ${JSON.stringify({ type: 'update', data })}\n\n`;
    clients[coupleId].forEach(client => client.write(eventData));
  }
};

// Endpoint para que los clientes se suscriban a los eventos de su pareja
app.get('/api/couples/:id/events', (req, res) => {
  const { id: coupleId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!clients[coupleId]) {
    clients[coupleId] = [];
  }
  clients[coupleId].push(res);

  req.on('close', () => {
    clients[coupleId] = clients[coupleId].filter(client => client !== res);
    if (clients[coupleId].length === 0) {
      delete clients[coupleId];
    }
  });
});

// --- Middleware de Autenticación (Placeholder - CRÍTICO: ¡Implementar Autenticación Real!) ---
// ESTO ES UN PLACEHOLDER. PARA PRODUCCIÓN, NECESITARÍAS UN SISTEMA DE AUTENTICACIÓN
// COMO JWT, OAuth, o sesiones con un almacenamiento seguro.
const authenticateCouple = (req: Request, res: Response, next: NextFunction) => {
  const coupleIdFromParams = req.params.id;
  // En un sistema real, verificarías un token JWT en el header 'Authorization'
  // o una cookie de sesión, y obtendrías el userId asociado.
  // Por ahora, solo confirmamos que se está intentando acceder con un coupleId.
  if (!coupleIdFromParams) {
    return res.status(401).json({ message: 'No autenticado: ID de pareja requerido.' });
  }
  // En un sistema real: validar token -> obtener userId/coupleId asociado -> adjuntar a req.user o req.couple
  // req.coupleId = coupleIdFromParams; // Ejemplo si adjuntaras a la request
  next();
};

// --- Rutas de la API (Modificadas para notificar cambios y con validación Zod) ---

// Esquemas de validación para emparejamiento
const createCoupleSessionSchema = z.object({
    // En un sistema real, userId vendría del usuario autenticado, no del body
    // Para esta demo, lo mantenemos simple.
    userId: z.string().uuid().optional(), // optional para la creación inicial si no hay user
});

app.post('/api/couples/create', async (req, res, next) => {
  try {
    const { userId } = createCoupleSessionSchema.parse(req.body);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const couple = await prisma.couple.create({
      data: {
        user1Id: userId || 'anonymous_user_' + Math.random().toString(36).substring(2, 10), // Generar si no se provee
        inviteCode,
        sharedData: {}, // Inicializar como objeto vacío
      },
    });
    res.json({ coupleId: couple.id, pairingCode: couple.inviteCode });
  } catch (error) {
    next(error);
  }
});

const joinCoupleSessionSchema = z.object({
    userId: z.string().uuid().optional(), // optional para la creación inicial si no hay user
    code: z.string().length(6),
});

app.post('/api/couples/join', async (req, res, next) => {
    try {
        const { userId, code } = joinCoupleSessionSchema.parse(req.body);
        const couple = await prisma.couple.findFirst({ where: { inviteCode: code, user2Id: null } });

        if (!couple) {
            return res.status(404).json({ message: 'Código de invitación no válido o ya utilizado.' });
        }

        const updatedCouple = await prisma.couple.update({
            where: { id: couple.id },
            data: { user2Id: userId || 'anonymous_user_' + Math.random().toString(36).substring(2, 10) },
        });

        // Asegurarse de que sharedData es un objeto válido de CoupleData
        const coupleData: CoupleData = (updatedCouple.sharedData || {}) as CoupleData;
        sendUpdateToCouple(couple.id, coupleData); // Notificar al creador de la sesión

        res.json({ coupleId: updatedCouple.id, coupleData: coupleData });
    } catch (error) {
        next(error);
    }
});

app.get('/api/couples/:id', authenticateCouple, async (req, res, next) => {
  try {
    const couple = await prisma.couple.findUnique({ where: { id: req.params.id } });
    if (!couple) {
      return res.status(404).json({ message: 'Pareja no encontrada' });
    }
    // Asegurarse de que sharedData es un objeto válido de CoupleData
    const coupleData: CoupleData = (couple.sharedData || {}) as CoupleData;
    res.json(coupleData); // Devolver directamente sharedData
  } catch (error) {
    next(error);
  }
});

const desiresUpdateSchema = z.object({
    desires: z.array(z.string().min(1)).optional(),
});

// Ejemplo: Actualizar deseos y notificar a la pareja
app.post('/api/couples/:id/desires', authenticateCouple, async (req, res, next) => {
    try {
        const { id: coupleId } = req.params;
        const { desires } = desiresUpdateSchema.parse(req.body); // Validar la entrada

        const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
        if (!couple) return res.status(404).json({ message: "Pareja no encontrada" });

        const currentSharedData: CoupleData = (couple.sharedData || {}) as CoupleData;
        const updatedData: CoupleData = { ...currentSharedData, desires };

        const updatedCouple = await prisma.couple.update({
            where: { id: coupleId },
            data: { sharedData: updatedData as any }, // Prisma necesita 'any' para JSON, pero internamente lo tipamos
        });

        // Notificar a ambos miembros de la pareja sobre el cambio
        sendUpdateToCouple(coupleId, updatedCouple.sharedData as CoupleData);

        res.json(updatedCouple.sharedData);
    } catch (error) {
        next(error);
    }
});

const bodyMapUpdateSchema = z.object({
    bodyMap: z.record(z.string(), z.string()).optional(), // Un objeto con claves string y valores string
});

// Ejemplo: Actualizar BodyMap y notificar
app.post('/api/couples/:id/bodymap', authenticateCouple, async (req, res, next) => {
    try {
        const { id: coupleId } = req.params;
        const { bodyMap } = bodyMapUpdateSchema.parse(req.body); // Validar la entrada

        const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
        if (!couple) return res.status(404).json({ message: "Pareja no encontrada" });

        const currentSharedData: CoupleData = (couple.sharedData || {}) as CoupleData;
        const updatedData: CoupleData = { ...currentSharedData, bodyMap };

        const updatedCouple = await prisma.couple.update({
            where: { id: coupleId },
            data: { sharedData: updatedData as any }, // Prisma necesita 'any' para JSON
        });

        sendUpdateToCouple(coupleId, updatedCouple.sharedData as CoupleData);
        res.json(updatedCouple.sharedData);
    } catch (error) {
        next(error);
    }
});

// --- Rutas de la IA (Con prompts más seguros) ---

const storySchema = z.object({
  params: z.object({
    theme: z.string().min(3).max(100),
    intensity: z.string().min(3).max(50),
    length: z.string().min(3).max(50),
    protagonists: z.string().min(3).max(50),
  }),
});

app.post('/api/couples/:id/erotic-story', authenticateCouple, async (req, res, next) => {
  try {
    const { params } = storySchema.parse(req.body);
    
    // Prompt seguro: No se concatena directamente la entrada del usuario.
    const fullPrompt = `Crea una historia erótica para una pareja.
    - Tono/Mood: ${params.intensity}
    - Estilo de escritura: ${params.theme}
    - Protagonistas: ${params.protagonists}
    - Longitud: ${params.length}
    La historia debe ser sensual, respetuosa y centrada en la conexión de la pareja. Asegúrate de que el contenido sea explícitamente erótico y romántico.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Asumimos que el texto puede ser dividido en párrafos para el frontend
    const generatedStory = {
      title: "Vuestra Historia Teñida", // Podrías hacer que la IA genere el título también
      content: text.split('\n\n').filter(p => p.trim() !== '') // Dividir por doble salto de línea
    }
    res.json(generatedStory);
  } catch (error) {
    next(error);
  }
});


// Rutas de API existentes que ya usan createCoupleApiCall en api.ts (deben existir aquí en server.ts)
// Solo añado ejemplos de cómo deberían verse las rutas que son llamadas por api.ts
// Asegúrate de que todas las funciones exportadas en api.ts tengan una ruta correspondiente aquí.

app.post('/api/couples/:id/personal-challenge', authenticateCouple, async (req, res, next) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = "Genera un reto de autoexploración personal para la intimidad. Debe ser inspirador, seguro y enfocado en el crecimiento personal. Proporciona un título, una descripción y un enfoque (ej. 'Conocimiento Corporal', 'Comunicación Interna', 'Exploración Sensorial').";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Asume que la IA devuelve un JSON o un formato parseable para PersonalChallenge
    const challenge = JSON.parse(response.text()); // Esto podría requerir parsing más robusto
    res.json(challenge);
  } catch (error) {
    next(error);
  }
});

// AÑADE AQUÍ MÁS RUTAS DE API PARA LAS FUNCIONES DEFINIDAS EN `src/services/api.ts`
// SIGUIENDO EL PATRÓN authenticateCouple Y LA VALIDACIÓN ZOD SEGÚN NECESIDAD.
// POR EJEMPLO:
/*
app.post('/api/couples/:id/add-key', authenticateCouple, async (req, res, next) => {
    try {
        const { id: coupleId } = req.params;
        const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
        if (!couple) return res.status(404).json({ message: "Pareja no encontrada" });

        const currentSharedData: CoupleData = (couple.sharedData || {}) as CoupleData;
        const updatedData: CoupleData = { ...currentSharedData, keys: (currentSharedData.keys || 0) + 1 };

        const updatedCouple = await prisma.couple.update({
            where: { id: coupleId },
            data: { sharedData: updatedData as any },
        });

        sendUpdateToCouple(coupleId, updatedCouple.sharedData as CoupleData);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});
*/


// --- Middleware de Gestión de Errores Centralizado ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log del error para depuración

  // Si el error es de validación de Zod
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      message: 'Datos de entrada no válidos.',
      errors: err.errors,
    });
  }

  // Otros errores
  res.status(500).json({
    message: 'Ha ocurrido un error inesperado en el servidor.',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});