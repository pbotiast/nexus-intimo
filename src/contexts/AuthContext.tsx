// src/contexts/AuthContext.tsx - VERSIÓN COMPLETA Y CORREGIDA

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app'; // <--- CORRECCIÓN 1
import { 
  getAuth, // <--- CORRECCIÓN 2
  onAuthStateChanged, 
  User, 
  signInAnonymously 
} from 'firebase/auth';

// Tu configuración de Firebase, que ya está bien
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa Firebase con la sintaxis moderna y exporta el objeto 'auth'
const app = initializeApp(firebaseConfig); // <--- CORRECCIÓN 3
export const auth = getAuth(app); // <--- CORRECCIÓN 4

// El resto de tu archivo ya está bien, no necesita cambios
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('authToken', user.uid); // Ejemplo de guardar un identificador
      } else {
        // Si no hay usuario, intenta iniciar sesión anónimamente
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};