import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Import all context providers
import { CoupleProvider } from './contexts/CoupleContext';
import { EmpathyEngineProvider } from './contexts/EmpathyEngineContext';
import { KeysProvider } from './contexts/KeysContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PassportProvider } from './contexts/PassportContext';
// import { ThemeProvider } from './contexts/ThemeContext'; // Uncomment if you have this file

// Import components and views from within the 'src' directory
import Home from '../views/Home';
import NexoGuide from '../views/NexoGuide';
import StoryWeaver from '../views/StoryWeaver';
import Adventures from '../views/Adventures';
import PassionPassport from '../views/PassionPassport';
import BodyMap from '../views/BodyMap';
import DesirePath from '../views/DesirePath';
import SoulMirror from '../views/SoulMirror';
import WishChest from '../views/WishChest';
import TandemJournal from '../views/TandemJournal';
import SexDice from '../views/SexDice';
import CouplesIntimacy from '../views/CouplesIntimacy';
import Mastery from '../views/Mastery';
import MyJourney from '../views/MyJourney';
import AudioGuides from '../views/AudioGuides';
import Sidebar from './components/Sidebar'; // Import the sidebar component


/**
 * AppLayout provides the consistent visual structure for the authenticated part of the app.
 * It also wraps all page-level components with the necessary context providers.
 */
const AppLayout = () => (
  <PassportProvider>
    <KeysProvider>
      <EmpathyEngineProvider>
        <div className="flex h-screen bg-gray-900 text-white">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {/* Child routes defined in the router will render here */}
            <Outlet /> 
          </main>
        </div>
      </EmpathyEngineProvider>
    </KeysProvider>
  </PassportProvider>
);

// Define the application routes using the new layout structure
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
 * The main App component. It sets up the top-level providers.
 * The CoupleProvider acts as a gatekeeper, showing either the
 * login/pairing modal or the main application content (its children).
 */
function App() {
  return (
    // <ThemeProvider>
      <NotificationProvider>
        <CoupleProvider>
          {/* When the user is paired, CoupleProvider will render its children,
              which is the RouterProvider that displays the main app. */}
          <RouterProvider router={router} />
        </CoupleProvider>
      </NotificationProvider>
    // </ThemeProvider>
  );
}

export default App;
