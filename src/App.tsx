import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Import all context providers using aliases
import { CoupleProvider } from '@contexts/CoupleContext';
import { EmpathyEngineProvider } from '@contexts/EmpathyEngineContext';
import { KeysProvider } from '@contexts/KeysContext';
import { NotificationProvider } => '@contexts/NotificationContext';
import { PassportProvider } from '@contexts/PassportContext';
// import { ThemeProvider } from './contexts/ThemeContext'; // Uncomment if you have this file

// Import components and views using aliases
import Sidebar from '@components/Sidebar';
import Home from '@views/Home';
import NexoGuide from '@views/NexoGuide';
import StoryWeaver from '@views/StoryWeaver';
import Adventures from '@views/Adventures';
import PassionPassport from '@views/PassionPassport';
import BodyMap from '@views/BodyMap';
import DesirePath from '@views/DesirePath';
import SoulMirror from '@views/SoulMirror';
import WishChest from '@views/WishChest';
import TandemJournal from '@views/TandemJournal';
import SexDice from '@views/SexDice';
import CouplesIntimacy from '@views/CouplesIntimacy';
import Mastery from '@views/Mastery';
import MyJourney from '@views/MyJourney';
import AudioGuides from '@views/AudioGuides';

/**
 * AppLayout proporciona la estructura visual consistente para la parte autenticada de la aplicación.
 * Ahora, solo contiene los elementos estructurales (Sidebar, main content area) y no los proveedores de contexto.
 */
const AppLayout = () => (
  <div className="flex h-screen bg-gray-900 text-white">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Las rutas hijas definidas en el router se renderizarán aquí */}
      <Outlet /> 
    </main>
  </div>
);

// Define las rutas de la aplicación utilizando la nueva estructura de diseño
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'nexo-guide', element: <NexoGuide /> },
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

/**
 * El componente principal de la aplicación. Configura los proveedores de nivel superior.
 * CoupleProvider actúa como un guardián, mostrando el modal de inicio de sesión/emparejamiento
 * o el contenido principal de la aplicación (sus hijos).
 */
function App() {
  return (
    // <ThemeProvider>
      <NotificationProvider>
        {/* Mueve los proveedores de contexto principales aquí para que estén disponibles
            para los componentes internos de CoupleProvider (como PairingModal)
            y para todas las rutas de la aplicación. */}
        <PassportProvider>
          <KeysProvider>
            <EmpathyEngineProvider>
              <CoupleProvider>
                {/* Cuando el usuario está emparejado, CoupleProvider renderizará sus hijos,
                    que es el RouterProvider que muestra la aplicación principal. */}
                <RouterProvider router={router} />
              </CoupleProvider>
            </EmpathyEngineProvider>
          </KeysProvider>
        </PassportProvider>
      </NotificationProvider>
    // </ThemeProvider>
  );
}

export default App;
