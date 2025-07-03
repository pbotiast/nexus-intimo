import React, { useState, useEffect, useContext, createContext } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// 1. Importa la función de inicialización desde tu servicio de API
import { initializeUser } from './services/api'; 

// 2. Importa tus vistas y componentes
import Home from './views/Home'; // Asegúrate de que la ruta es correcta
import Sidebar from './components/Sidebar'; // Asegúrate de que la ruta es correcta
// ... importa aquí el resto de tus vistas (StoryWeaver, Adventures, etc.)

// --- Contexto de Autenticación Anónima ---
// Esto permite que cualquier componente sepa si el usuario está cargando o ya tiene un ID.
interface AuthContextType {
    userId: string | null;
    isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | null>(null);

// Un "hook" personalizado para acceder fácilmente al contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};
// --- Fin del Contexto ---


// --- Definición de la Estructura y Rutas de la App ---

// El layout principal de la aplicación con la barra lateral
const AppLayout = () => (
    <div className="flex h-screen bg-gray-900 text-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet /> {/* Aquí se renderizarán las vistas según la ruta */}
        </main>
    </div>
);

// El enrutador de la aplicación
const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { index: true, element: <Home /> },
            // { path: 'story-weaver', element: <StoryWeaver /> },
            // { path: 'adventures', element: <Adventures /> },
            // ... define aquí todas tus otras rutas
        ],
    },
]);

// --- Componentes de la App ---

// Este componente decide qué mostrar: la pantalla de carga o la app principal
function AppContent() {
    const { isLoading, userId } = useAuth();

    if (isLoading) {
        return <div className="w-screen h-screen flex justify-center items-center bg-gray-900 text-white">Cargando...</div>;
    }

    if (!userId) {
        return <div className="w-screen h-screen flex justify-center items-center bg-gray-900 text-white">Error: No se pudo identificar al usuario. Por favor, refresca la página.</div>;
    }

    // Una vez que el usuario está identificado, muestra el enrutador con las vistas
    return <RouterProvider router={router} />;
}

// El componente raíz de toda la aplicación
function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Este useEffect se ejecuta solo una vez cuando la aplicación arranca
    useEffect(() => {
        const init = async () => {
            try {
                // 3. Llama a la función centralizada desde api.ts
                const initData = await initializeUser(); 
                setUserId(initData.userId);
                // Aquí también podrías guardar los datos de la pareja en un estado global (Context, Zustand, etc.)
                // por ejemplo: setCoupleData(initData.coupleData);
            } catch (error) {
                console.error("Error initializing user:", error);
                // Opcional: podrías mostrar un mensaje de error más visible al usuario
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []); // El array vacío [] asegura que se ejecute solo una vez.

    // El AuthContext.Provider "envuelve" la app para que todos los componentes hijos
    // puedan acceder a `userId` y `isLoading` a través del hook `useAuth`.
    return (
        <AuthContext.Provider value={{ userId, isLoading }}>
            <AppContent />
        </AuthContext.Provider>
    );
}

export default App;
