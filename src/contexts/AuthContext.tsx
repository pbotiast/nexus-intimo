// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';

// Define la interfaz para el contexto de autenticación
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  auth: Auth | null; // Exponer la instancia de Auth
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInAnon: () => Promise<void>;
}

// Crea el contexto con valores por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Propiedades para el proveedor de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// --- Configuración de Firebase Client SDK ---
// REEMPLAZA ESTO CON LA CONFIGURACIÓN DE TU PROYECTO DE FIREBASE
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;

try {
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  console.log("Firebase Client SDK inicializado correctamente.");
} catch (error) {
  console.error("Error al inicializar Firebase Client SDK:", error);
  // Considera mostrar un mensaje de error al usuario o un fallback UI
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true); // Estado de carga inicial

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    // Suscribirse a cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // La carga ha terminado una vez que se resuelve el estado inicial
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(firebaseAuth);
    } finally {
      setLoading(false);
    }
  };

  const signInAnon = async () => {
    setLoading(true);
    try {
      await signInAnonymously(firebaseAuth);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    auth: firebaseAuth,
    login,
    register,
    logout,
    signInAnon,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
