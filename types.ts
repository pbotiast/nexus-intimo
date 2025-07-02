

/**
 * Parámetros para la generación de una historia erótica personalizada.
 */
export interface StoryParams {
  theme: string;
  intensity: string;
  length: string;
  protagonists: string;
}

/**
 * Representa una historia generada por la IA, con un título y contenido dividido en párrafos.
 */
export interface GeneratedStory {
  title: string;
  content: string[];
}

/**
 * Alias para una historia generada, utilizada en el contexto de la "Crónica Íntima".
 */
export type IntimateChronicle = GeneratedStory;


/**
 * Un reto de autoexploración personal generado por la IA.
 */
export interface PersonalChallenge {
  title: string;
  description: string;
  focus: string;
}

/**
 * Un reto para parejas con un nivel de intensidad definido.
 */
export interface CoupleChallenge {
  level: 'Suave' | 'Picante' | 'Atrevido';
  title: string;
  description: string;
}

/**
 * Una pregunta diseñada para romper el hielo y fomentar la comunicación.
 */
export interface IcebreakerQuestion {
    question: string;
    category: string;
}

/**
 * Define la estructura de un escenario de juego de roles.
 */
export interface RoleplayScenario {
    title: string;
    setting: string;
    character1: string;
    character2: string;
    plot: string;
}

/**
 * Una idea para una cita, clasificada por categoría.
 */
export interface DateIdea {
    title: string;
    description: string;
    category: 'En Casa' | 'Aventura' | 'Romántica' | 'Cultural';
}

/**
 * Describe una postura sexual con su tipo y una imagen de referencia.
 */
export interface SexualPosition {
  name: string;
  description: string;
  imageUrl: string;
  type: 'Intimidad' | 'Placer Clitoriano' | 'Placer Vaginal' | 'Acrobático';
}

// --- Tipos para el Juego "El Sendero del Deseo" ---

export type BoardSquareType = 'start' | 'physical_challenge' | 'truth_or_dare' | 'intimate_question' | 'clothing_penalty' | 'special' | 'finish';

export interface BoardSquare {
  id: number;
  type: BoardSquareType;
  title: string;
}

export interface GameChallenge {
  type: 'Verdad' | 'Atrevimiento' | 'Reto Físico' | 'Prenda o Reto' | 'Pregunta Íntima';
  title: string;
  description: string;
}

// --- Tipos para "El Pasaporte de la Pasión" ---

export type StampCategory = 'Postura Nueva' | 'Fantasía Cumplida' | 'Juego de Rol' | 'Lugar Inusual' | 'Cita Memorable' | 'Logro Personal';

/**
 * Representa un hito o recuerdo guardado en el Pasaporte de la Pasión.
 */
export interface PassionStamp {
  id: string;
  category: StampCategory;
  title: string;
  notes: string;
  date: string;
}

/**
 * Define un logro que puede ser desbloqueado por los usuarios.
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: (stamps: PassionStamp[]) => boolean;
}

/**
 * Datos necesarios para crear un nuevo sello en el pasaporte.
 */
export type StampData = Partial<Omit<PassionStamp, 'id' | 'date'>>;

export interface PassportContextType {
    stamps: PassionStamp[];
    addStamp: (stampData: StampData) => void;
    deleteStamp: (id: string) => void;
    isModalOpen: boolean;
    initialStampData: StampData | null;
    openStampModal: (data?: StampData) => void;
    closeStampModal: () => void;
}


// --- Tipos para "Guías Sensoriales" ---
export interface AudioGuide {
  id: number;
  category: 'Meditación de Conexión' | 'Masaje Erótico Guiado' | 'Viaje Sensorial';
  title: string;
  description: string;
  duration: string;
  sourceUrl: string;
  sourceType: 'audio' | 'youtube';
  coverArt: string;
}

// --- Tipos para "El Ritual Íntimo" ---

export type RitualEnergy = 'Conexión Tierna' | 'Juego y Diversión' | 'Pasión Intensa';

export type RitualStepType = 'audio_guide' | 'couple_challenge' | 'position' | 'game_dice' | 'game_board' | 'story' | 'conversation' | 'custom';

export interface RitualStep {
  title: string;
  description: string;
  type: RitualStepType;
}

/**
 * Un plan de varios pasos generado por la IA para una sesión íntima.
 */
export interface IntimateRitual {
  title: string;
  steps: RitualStep[];
}

// --- Tipos para QuestConnect 2.0 ---
export type AdventureStyle = 'Conexión Romántica' | 'Aventura Juguetona' | 'Misión Atrevida';
export type RealWorldAdventure = IntimateRitual;


// --- Tipos para "Sintonía Fina" (Feedback IA) ---
export type PreferenceCategory = 'story_theme' | 'story_intensity' | 'challenge_level' | 'challenge_type' | 'date_category' | 'roleplay_theme' | 'ritual_energy' | 'mission_title' | 'real_world_adventure' | 'wish' | 'intimate_chronicle' | 'soul_reflection' | 'daily_spark' | 'tandem_prompt';
export type Feedback = 'like' | 'dislike';

/**
 * Almacena las preferencias del usuario para personalizar las generaciones de la IA.
 * La clave es una combinación de categoría y valor, y el valor es una puntuación.
 */
export interface AiPreferences {
    [key: string]: number; // key is e.g., 'story_theme:Fantasía de poder', value is score
}

// --- Tipos para "Misión Íntima Semanal" ---
export interface WeeklyMission {
  title: string;
  steps: RitualStep[];
}

export interface StoredWeeklyMission {
  mission: WeeklyMission;
  weekNumber: number;
  claimed: boolean; // Para saber si la llave ya fue reclamada
}

// --- Tipos para "El Cofre de los Deseos" ---
/**
 * Un deseo o fantasía secreta añadida por un miembro de la pareja.
 */
export interface Wish {
    id: string;
    text: string;
    author: 'partner1' | 'partner2'; // Placeholder para futura diferenciación
}

// --- Tipos para Notificaciones ---
export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface NotificationContextType {
    permission: NotificationPermission;
    requestPermission: () => void;
    showNotification: (title: string, body: string) => void;
}

// --- Tipos para Nexo Guía ---
/**
 * Un único mensaje en una conversación de chat con la IA.
 */
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- Tipos para "El Mapa del Cuerpo" ---
export type SensationType = 'Beso Suave' | 'Caricia Ligera' | 'Masaje Profundo' | 'Mordisco Juguetón' | 'Zona Erógena Principal';

/**
 * Una marca en el mapa corporal, indicando una zona de placer.
 */
export interface BodyMark {
  id: string;
  x: number; // percentage
  y: number; // percentage
  bodySide: 'front' | 'back';
  sensation: SensationType;
  note: string;
}

// --- Tipos para "El Espejo del Alma" ---
export type PassionPillar = 'Conexión Emocional' | 'Aventura y Novedad' | 'Juego y Diversión' | 'Fantasía e Intensidad';

export type PassionCompassScores = Record<PassionPillar, number>;

/**
 * Una reflexión generada por la IA sobre el viaje íntimo de la pareja.
 */
export interface SoulReflection {
    title: string;
    content: string[];
    invitations: {
        text: string;
        link: string;
    }[];
}

// --- Tipos para "Motor de Empatía" ---
export interface DailySpark {
    title: string;
    description: string;
}

export interface StoredDailySpark {
    spark: DailySpark;
    date: string; // ISO string
}

/**
 * Una entrada en el diario tándem, con una pregunta y las respuestas de ambos.
 */
export interface TandemEntry {
    id: string;
    prompt: string;
    answer1: string | null;
    answer2: string | null;
}

// --- Tipos para Sincronización de Pareja ---
/**
 * El objeto de datos principal para una sesión de pareja, que se sincroniza en tiempo real.
 */
export interface CoupleData {
  id: string;
  keys: number;
  stamps: PassionStamp[];
  wishes: Wish[];
  weeklyMission: StoredWeeklyMission | null;
  bodyMarks: BodyMark[];
  tandemEntry: TandemEntry | null;
  aiPreferences: AiPreferences;
  // Other shared data can be added here
}


/**
 * El tipo de objeto para el Contexto de Pareja, que provee datos y funciones a toda la aplicación.
 */
export interface CoupleContextType {
  coupleData: CoupleData | null;
  coupleId: string | null;
  isPaired: boolean;
  pairingCode: string | null;
  isLoading: boolean;
  createCoupleSession: () => Promise<void>;
  joinCoupleSession: (code: string) => Promise<void>;
  logout: () => void;
  /**
   * Un proxy a las funciones de la API, simplificado para los componentes.
   * Estas funciones ya incluyen el `coupleId` necesario.
   */
  api: {
    generateEroticStory: (args: { params: StoryParams }) => Promise<GeneratedStory | null>;
    generatePersonalChallenge: () => Promise<PersonalChallenge | null>;
    generateCouplesChallenges: () => Promise<CoupleChallenge[] | null>;
    generateIcebreakerQuestion: () => Promise<IcebreakerQuestion | null>;
    generateRoleplayScenario: (args: { theme: string }) => Promise<RoleplayScenario | null>;
    generateDateIdea: (args: { category: string }) => Promise<DateIdea | null>;
    generateGameChallenge: (args: { type: GameChallenge['type'] }) => Promise<GameChallenge | null>;
    generateIntimateRitual: (args: { energy: RitualEnergy }) => Promise<IntimateRitual | null>;
    generateWeeklyMission: () => Promise<{ success: boolean }>;
    claimMissionReward: () => Promise<{ success: boolean }>;
    generateRealWorldAdventure: (args: { coords: { latitude: number; longitude: number }; style: AdventureStyle }) => Promise<RealWorldAdventure | null>;
    generateIntimateChronicle: () => Promise<IntimateChronicle | null>;
    generateSoulMirrorReflection: (args: { scores: PassionCompassScores }) => Promise<SoulReflection | null>;
    generateDailySpark: (args: { scores: PassionCompassScores }) => Promise<DailySpark | null>;
    generateTandemJournalPrompt: () => Promise<{ success: boolean }>;
    continueNexoChat: (args: { messages: ChatMessage[] }) => Promise<{ text: string; } | null>;
    addStamp: (args: { stampData: StampData }) => Promise<void>;
    deleteStamp: (id: string) => Promise<void>;
    addWish: (args: { text: string }) => Promise<void>;
    revealWish: () => Promise<Wish | null>;
    updateBodyMarks: (args: { marks: BodyMark[] }) => Promise<void>;
    saveTandemAnswer: (args: { partner: 'partner1' | 'partner2'; answer: string }) => Promise<void>;
    recordFeedback: (args: { category: PreferenceCategory; value: string; feedback: Feedback }) => Promise<void>;
    addKey: () => Promise<void>;
    useKey: () => Promise<boolean>;
  };
}
