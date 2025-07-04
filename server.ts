// server.ts
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import bodyParser from 'body-parser';
import { z } from 'zod';
<<<<<<< HEAD
import { CoupleData } from './src/types'; // Importar el tipo CoupleData

// Importar Firebase Admin SDK
import * as admin from 'firebase-admin';

// --- Configuración de Firebase Admin SDK ---
// CRÍTICO: En producción, carga esto de forma segura (ej. variables de entorno, archivo de clave)
// NO SUBAS TU ARCHIVO DE CLAVE DE SERVICIO DIRECTAMENTE AL REPOSITORIO
// Ejemplo de carga desde una variable de entorno (JSON stringificado)
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
// O si tienes un archivo:
// const serviceAccount = require('./path/to/your/serviceAccountKey.json');

// Placeholder para la configuración del servicio de cuenta (REEMPLAZAR CON TU CLAVE REAL)
// Para desarrollo local, podrías poner un JSON aquí, pero NUNCA en producción
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Manejar saltos de línea si viene de env
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  "universe_domain": "googleapis.com"
};


// Inicializar Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  console.log("Firebase Admin SDK inicializado correctamente.");
} catch (error) {
  console.error("Error al inicializar Firebase Admin SDK:", error);
  process.exit(1); // Salir si Firebase Admin no se puede inicializar
}

=======
import { CoupleData } from '../src/types'; // Importar el tipo CoupleData

// Asegúrate de que las variables de entorno están cargadas (ej. con dotenv en un entorno real)
// require('dotenv').config(); // Descomentar si usas dotenv
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97

const app = express();
// NOTA CRÍTICA: En producción, Prisma debe conectarse a una base de datos real (PostgreSQL, MySQL, etc.),
// no depender de un archivo local o de la mención de 'db.json' en el README, que es para desarrollo.
const prisma = new PrismaClient();

<<<<<<< HEAD
// Verificación de la API Key de Gemini al inicio
=======
// Verificación de la API Key al inicio
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: La variable de entorno GEMINI_API_KEY no está definida.");
  process.exit(1); // Salir si la clave no está presente
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(bodyParser.json());

// --- Middleware de Autenticación Firebase ---
// Este middleware verifica el token de ID de Firebase enviado por el cliente.
const authenticateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado: Token no proporcionado o formato incorrecto.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Adjuntar el UID del usuario a la solicitud para uso posterior
    (req as any).user = decodedToken; // Añadimos 'user' a la request para que las rutas lo usen
    next();
  } catch (error) {
    console.error("Error al verificar el token de Firebase:", error);
    return res.status(403).json({ message: 'No autorizado: Token inválido o expirado.' });
  }
};

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
// Este endpoint no requiere autenticación de token, ya que un usuario se suscribe
// a un coupleId específico que ya debería conocer. La autorización para acceder
// a los datos de la pareja se manejará en las rutas de datos.
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

<<<<<<< HEAD
// --- Rutas de la API (Modificadas para usar autenticación y notificar cambios) ---

// Esquemas de validación para emparejamiento
const createCoupleSessionSchema = z.object({
    // userId ahora vendrá del token de Firebase, no del body.
    // Lo mantenemos opcional aquí para el caso de un usuario anónimo si se permite.
    // En un sistema real, userId sería mandatorio y vendría del token.
    // Para esta demo, el userId se extraerá del token y se usará.
});

app.post('/api/couples/create', authenticateFirebaseToken, async (req, res, next) => {
  try {
    const firebaseUid = (req as any).user.uid; // UID del usuario autenticado por Firebase
=======
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
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Buscar si el usuario ya está en una pareja
    const existingCouple = await prisma.couple.findFirst({
      where: {
        OR: [
          { user1FirebaseUid: firebaseUid },
          { user2FirebaseUid: firebaseUid }
        ]
      }
    });

    if (existingCouple) {
      return res.status(400).json({ message: 'Ya estás en una pareja. Abandona la actual para crear una nueva.' });
    }

    const couple = await prisma.couple.create({
      data: {
<<<<<<< HEAD
        user1FirebaseUid: firebaseUid,
=======
        user1Id: userId || 'anonymous_user_' + Math.random().toString(36).substring(2, 10), // Generar si no se provee
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
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
<<<<<<< HEAD
    code: z.string().length(6),
});

app.post('/api/couples/join', authenticateFirebaseToken, async (req, res, next) => {
    try {
        const firebaseUid = (req as any).user.uid; // UID del usuario autenticado por Firebase
        const { code } = joinCoupleSessionSchema.parse(req.body);

        // Buscar si el usuario ya está en una pareja
        const existingCouple = await prisma.couple.findFirst({
          where: {
            OR: [
              { user1FirebaseUid: firebaseUid },
              { user2FirebaseUid: firebaseUid }
            ]
          }
        });

        if (existingCouple) {
          return res.status(400).json({ message: 'Ya estás en una pareja. Abandona la actual para unirte a otra.' });
        }

        const couple = await prisma.couple.findFirst({ 
          where: { 
            inviteCode: code, 
            user2FirebaseUid: null // Solo permitir unirse si el segundo slot está libre
          } 
        });
=======
    userId: z.string().uuid().optional(), // optional para la creación inicial si no hay user
    code: z.string().length(6),
});

app.post('/api/couples/join', async (req, res, next) => {
    try {
        const { userId, code } = joinCoupleSessionSchema.parse(req.body);
        const couple = await prisma.couple.findFirst({ where: { inviteCode: code, user2Id: null } });
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97

        if (!couple) {
            return res.status(404).json({ message: 'Código de invitación no válido o ya utilizado.' });
        }

        // Asegurarse de que el usuario que intenta unirse no sea el mismo que creó la pareja
        if (couple.user1FirebaseUid === firebaseUid) {
            return res.status(400).json({ message: 'No puedes unirte a tu propia sesión.' });
        }

        const updatedCouple = await prisma.couple.update({
            where: { id: couple.id },
<<<<<<< HEAD
            data: { user2FirebaseUid: firebaseUid },
=======
            data: { user2Id: userId || 'anonymous_user_' + Math.random().toString(36).substring(2, 10) },
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
        });

        // Asegurarse de que sharedData es un objeto válido de CoupleData
        const coupleData: CoupleData = (updatedCouple.sharedData || {}) as CoupleData;
        sendUpdateToCouple(couple.id, coupleData); // Notificar al creador de la sesión

        res.json({ coupleId: updatedCouple.id, coupleData: coupleData });
    } catch (error) {
        next(error);
    }
});

<<<<<<< HEAD
// Middleware para verificar que el usuario autenticado pertenece a la pareja solicitada
const authorizeCoupleAccess = async (req: Request, res: Response, next: NextFunction) => {
  const firebaseUid = (req as any).user.uid;
  const coupleId = req.params.id;

=======
app.get('/api/couples/:id', authenticateCouple, async (req, res, next) => {
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
  try {
    const couple = await prisma.couple.findUnique({ where: { id: coupleId } });

    if (!couple) {
      return res.status(404).json({ message: 'Pareja no encontrada.' });
    }
<<<<<<< HEAD

    if (couple.user1FirebaseUid !== firebaseUid && couple.user2FirebaseUid !== firebaseUid) {
      return res.status(403).json({ message: 'Acceso denegado: No perteneces a esta pareja.' });
    }
    // Adjuntar la pareja a la solicitud para evitar una segunda consulta en las rutas
    (req as any).couple = couple;
    next();
  } catch (error) {
    next(error); // Pasa el error al manejador de errores centralizado
  }
};

app.get('/api/couples/:id', authenticateFirebaseToken, authorizeCoupleAccess, async (req, res, next) => {
  try {
    const couple = (req as any).couple; // Obtenemos la pareja del middleware
=======
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
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
<<<<<<< HEAD
app.post('/api/couples/:id/desires', authenticateFirebaseToken, authorizeCoupleAccess, async (req, res, next) => {
=======
app.post('/api/couples/:id/desires', authenticateCouple, async (req, res, next) => {
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
    try {
        const { id: coupleId } = req.params;
        const { desires } = desiresUpdateSchema.parse(req.body); // Validar la entrada

        const couple = (req as any).couple; // Obtenemos la pareja del middleware

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
<<<<<<< HEAD
app.post('/api/couples/:id/bodymap', authenticateFirebaseToken, authorizeCoupleAccess, async (req, res, next) => {
=======
app.post('/api/couples/:id/bodymap', authenticateCouple, async (req, res, next) => {
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
    try {
        const { id: coupleId } = req.params;
        const { bodyMap } = bodyMapUpdateSchema.parse(req.body); // Validar la entrada

        const couple = (req as any).couple; // Obtenemos la pareja del middleware

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

// Ruta para abandonar una pareja
app.post('/api/couples/:id/leave', authenticateFirebaseToken, authorizeCoupleAccess, async (req, res, next) => {
  try {
    const firebaseUid = (req as any).user.uid;
    const couple = (req as any).couple;

    if (couple.user1FirebaseUid === firebaseUid) {
      // Si es user1, mover user2 a user1 y limpiar user2, o eliminar si no hay user2
      if (couple.user2FirebaseUid) {
        await prisma.couple.update({
          where: { id: couple.id },
          data: {
            user1FirebaseUid: couple.user2FirebaseUid,
            user2FirebaseUid: null,
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Generar nuevo código
          },
        });
      } else {
        // Si no hay user2, eliminar la pareja
        await prisma.couple.delete({ where: { id: couple.id } });
      }
    } else if (couple.user2FirebaseUid === firebaseUid) {
      // Si es user2, simplemente limpiar user2
      await prisma.couple.update({
        where: { id: couple.id },
        data: { user2FirebaseUid: null },
      });
    } else {
      return res.status(403).json({ message: 'No puedes abandonar una pareja a la que no perteneces.' });
    }

    sendUpdateToCouple(couple.id, { message: 'Un miembro ha abandonado la pareja.' } as any); // Notificar a la pareja
    res.json({ message: 'Has abandonado la pareja exitosamente.' });
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

<<<<<<< HEAD
app.post('/api/couples/:id/erotic-story', authenticateFirebaseToken, authorizeCoupleAccess, async (req, res, next) => {
=======
app.post('/api/couples/:id/erotic-story', authenticateCouple, async (req, res, next) => {
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
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


<<<<<<< HEAD
app.post('/api/couples/:id/personal-challenge', authenticateFirebaseToken, authorizeCoupleAccess, async (req, res, next) => {
=======
// Rutas de API existentes que ya usan createCoupleApiCall en api.ts (deben existir aquí en server.ts)
// Solo añado ejemplos de cómo deberían verse las rutas que son llamadas por api.ts
// Asegúrate de que todas las funciones exportadas en api.ts tengan una ruta correspondiente aquí.

app.post('/api/couples/:id/personal-challenge', authenticateCouple, async (req, res, next) => {
>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
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

<<<<<<< HEAD
=======
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


>>>>>>> e73fa3c0a1f704d35b00744056447fd45d55ae97
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
