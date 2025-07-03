// src/App.tsx - CÓDIGO COMPLETO

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Importa tus vistas y componentes
import Home from './views/Home.tsx';
import StoryWeaver from './views/StoryWeaver.tsx';
import Adventures from './views/Adventures.tsx';
import PassionPassport from './views/PassionPassport.tsx';
import BodyMap from './views/BodyMap.tsx';
import DesirePath from './views/DesirePath.tsx';
import SoulMirror from './views/SoulMirror.tsx';
import WishChest from './views/WishChest.tsx';
import TandemJournal from './views/TandemJournal.tsx';
import SexDice from './views/SexDice.tsx';
import CouplesIntimacy from './views/CouplesIntimacy.tsx';
import Mastery from './views/Mastery.tsx';
import MyJourney from './views/MyJourney.tsx';
import AudioGuides from './views/AudioGuides.tsx';
import Sidebar from './components/Sidebar.tsx';
import PairingPage from './views/PairingPage.tsx'; // Importa la nueva página

// --- Contexto de Autenticación Anónima ---
interface AuthContextType {
    userId: string | null;
    coupleId: string | null;
    isLoading: boolean;
    setCoupleId: (id: string | null) => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

// --- Componente de Layout Principal ---
const AppLayout = () => {
    const { coupleId } = useAuth();

    // Si el usuario está autenticado pero no tiene pareja, lo enviamos a la página de emparejamiento.
    if (!coupleId) {
        return <PairingPage />;
    }

    return (
        <div className="flex h-screen bg-brand-navy text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

// --- Definición de Rutas ---
const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'story-weaver', element: <StoryWeaver /> },
            { path: 'adventures', element: <Adventures /> },
            { path: 'passion-passport', element: <PassionPassport /> },
            { path: 'body-map', element: <BodyMap /> },
            { path: 'desire-path', element: <DesirePath /> },
            { path: 'soul-mirror', element: <SoulMirror /> },
            { path: 'wish-chest', element: <WishChest /> },
            { path: 'tandem-journal', element: <TandemJournal /> },
            { path: 'sex-dice', element: <SexDice /> },
            { path: 'couples-intimacy', element: <CouplesIntimacy /> },
            { path: 'mastery', element: <Mastery /> },
            { path: 'my-journey', element: <MyJourney /> },
            { path: 'audio-guides', element: <AudioGuides /> },
        ],
    },
]);


// --- Componente Contenedor ---
// Este componente decide qué mostrar basándose en el estado de autenticación.
function AppContent() {
    const { isLoading, userId } = useAuth();

    if (isLoading) {
        return <div className="w-screen h-screen flex justify-center items-center bg-brand-deep-purple text-white">Cargando tu sesión...</div>;
    }
    if (!userId) {
        return <div className="w-screen h-screen flex justify-center items-center bg-brand-deep-purple text-red-400">Error crítico: No se pudo identificar al usuario. Por favor, refresca la página o borra las cookies.</div>;
    }
    return <RouterProvider router={router} />;
}

// --- Componente Principal de la App ---
function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [coupleId, setCoupleIdState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setCoupleId = (id: string | null) => {
        setCoupleIdState(id);
    };

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const response = await fetch('/api/users/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: localStorage.getItem('nexusIntimoUserId') })
                });

                if (!response.ok) throw new Error('Failed to initialize user session.');
                
                const data = await response.json();
                
                localStorage.setItem('nexusIntimoUserId', data.userId);
                setUserId(data.userId);
                setCoupleId(data.coupleId); // El backend nos dice si ya estamos en una pareja
                console.log('User initialized:', data);
            } catch (error) {
                console.error("Error initializing user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeUser();
    }, []);

    return (
        <AuthContext.Provider value={{ userId, coupleId, isLoading, setCoupleId }}>
            <AppContent />
        </AuthContext.Provider>
    );
}

export default App;