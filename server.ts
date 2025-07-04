// server/src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import bodyParser from 'body-parser';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

app.use(cors());
app.use(bodyParser.json());

// --- Sistema de Sincronización en Tiempo Real (SSE) ---

// Almacena las conexiones abiertas de los clientes (res) por coupleId
const clients: { [coupleId: string]: Response[] } = {};

// Función para enviar actualizaciones a todos los clientes de una pareja
const sendUpdateToCouple = (coupleId: string, data: any) => {
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


// --- Rutas de la API (Modificadas para notificar cambios) ---

// Esquema de validación para emparejamiento
const pairingSchema = z.object({
  userId: z.string().uuid(),
});

app.post('/api/pair', async (req, res, next) => {
  try {
    const { userId } = pairingSchema.parse(req.body);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const couple = await prisma.couple.create({
      data: {
        user1Id: userId,
        inviteCode,
        sharedData: {},
      },
    });
    res.json(couple);
  } catch (error) {
    next(error);
  }
});

const joinSchema = z.object({
    userId: z.string().uuid(),
    inviteCode: z.string().length(6),
});

app.post('/api/join', async (req, res, next) => {
    try {
        const { userId, inviteCode } = joinSchema.parse(req.body);
        const couple = await prisma.couple.findFirst({ where: { inviteCode, user2Id: null } });

        if (!couple) {
            return res.status(404).json({ message: 'Código de invitación no válido o ya utilizado.' });
        }

        const updatedCouple = await prisma.couple.update({
            where: { id: couple.id },
            data: { user2Id: userId },
        });
        res.json(updatedCouple);
    } catch (error) {
        next(error);
    }
});

app.get('/api/couples/:id', async (req, res, next) => {
  try {
    const couple = await prisma.couple.findUnique({ where: { id: req.params.id } });
    if (!couple) {
      return res.status(404).json({ message: 'Pareja no encontrada' });
    }
    res.json(couple);
  } catch (error) {
    next(error);
  }
});

// Ejemplo: Actualizar deseos y notificar a la pareja
app.post('/api/couples/:id/desires', async (req, res, next) => {
    try {
        const { id: coupleId } = req.params;
        const { desires } = req.body; // Se espera un array de deseos

        const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
        if (!couple) return res.status(404).json({ message: "Pareja no encontrada" });

        const currentSharedData = (couple.sharedData as any) || {};
        const updatedData = { ...currentSharedData, desires };

        const updatedCouple = await prisma.couple.update({
            where: { id: coupleId },
            data: { sharedData: updatedData },
        });

        // Notificar a ambos miembros de la pareja sobre el cambio
        sendUpdateToCouple(coupleId, updatedCouple.sharedData);

        res.json(updatedCouple.sharedData);
    } catch (error) {
        next(error);
    }
});


// Ejemplo: Actualizar BodyMap y notificar
app.post('/api/couples/:id/bodymap', async (req, res, next) => {
    try {
        const { id: coupleId } = req.params;
        const { bodyMap } = req.body;

        const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
        if (!couple) return res.status(404).json({ message: "Pareja no encontrada" });

        const currentSharedData = (couple.sharedData as any) || {};
        const updatedData = { ...currentSharedData, bodyMap };

        const updatedCouple = await prisma.couple.update({
            where: { id: coupleId },
            data: { sharedData: updatedData },
        });

        sendUpdateToCouple(coupleId, updatedCouple.sharedData);
        res.json(updatedCouple.sharedData);
    } catch (error) {
        next(error);
    }
});

// --- Rutas de la IA (Con prompts más seguros) ---

const storySchema = z.object({
  prompt: z.string().min(10).max(500),
  mood: z.string(),
  style: z.string(),
});

app.post('/api/generate-story', async (req, res, next) => {
  try {
    const { prompt, mood, style } = storySchema.parse(req.body);
    
    // Prompt seguro: No se concatena directamente la entrada del usuario.
    const fullPrompt = `Crea una historia erótica para una pareja.
    - Tono/Mood: ${mood}
    - Estilo de escritura: ${style}
    - Tema principal proporcionado por la pareja: "${prompt}"
    La historia debe ser sensual, respetuosa y centrada en la conexión de la pareja.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    res.json({ story: response.text() });
  } catch (error) {
    next(error);
  }
});


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