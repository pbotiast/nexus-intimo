// src/App.tsx - CÓDIGO PARA LA ESTRUCTURA RECOMENDADA

import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import { CoupleProvider } from './contexts/CoupleContext.tsx';
import { EmpathyEngineProvider } from './contexts/EmpathyEngineContext.tsx';
import { KeysProvider } from './contexts/KeysContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { PassportProvider } from './contexts/PassportContext.tsx';

// Importaciones usando la ruta correcta: './views/...' porque 'views' está ahora al mismo nivel.
import Home from './views/Home.tsx';
import NexoGuide from './views/NexoGuide.tsx';
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

const AppLayout = () => (
  <KeysProvider>
    <PassportProvider>
      <EmpathyEngineProvider>
        <div className="flex h-screen bg-gray-900 text-white">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet /> 
          </main>
        </div>
      </EmpathyEngineProvider>
    </PassportProvider>
  </KeysProvider>
);

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

function App() {
  return (
      <NotificationProvider>
        <CoupleProvider>
          <RouterProvider router={router} />
        </CoupleProvider>
      </NotificationProvider>
  );
}

export default App;