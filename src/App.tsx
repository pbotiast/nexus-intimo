// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CoupleProvider } from './contexts/CoupleContext';
import { KeysProvider } from './contexts/KeysContext';
import { EmpathyEngineProvider } from './contexts/EmpathyEngineContext';
import { PassportProvider } from './contexts/PassportContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Importaciones corregidas para apuntar a la carpeta /views
import Home from './views/Home';
import BodyMap from './views/BodyMap';
import DesirePath from './views/DesirePath';
import StoryWeaver from './views/StoryWeaver';
import SexDice from './views/SexDice';
import PassionPassport from './views/PassionPassport';
import TandemJournal from './views/TandemJournal';
import SoulMirror from './views/SoulMirror';
import WishChest from './views/WishChest';
import MyJourney from './views/MyJourney';
import CouplesIntimacy from './views/CouplesIntimacy';
import Mastery from './views/Mastery';
import Adventures from './views/Adventures';
import AudioGuides from './views/AudioGuides';
import NexoGuide from './views/NexoGuide';
import PairingPage from './views/PairingPage';

import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  return (
    <Router>
      <KeysProvider>
        <CoupleProvider>
          <EmpathyEngineProvider>
            <PassportProvider>
              <NotificationProvider>
                <div className="flex bg-gray-900 text-white min-h-screen">
                  <Sidebar />
                  <main className="flex-1 p-4 md:p-10 ml-16 md:ml-64">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/body-map" element={<BodyMap />} />
                      <Route path="/desire-path" element={<DesirePath />} />
                      <Route path="/story-weaver" element={<StoryWeaver />} />
                      <Route path="/sex-dice" element={<SexDice />} />
                      <Route path="/passion-passport" element={<PassionPassport />} />
                      <Route path="/tandem-journal" element={<TandemJournal />} />
                      <Route path="/soul-mirror" element={<SoulMirror />} />
                      <Route path="/wish-chest" element={<WishChest />} />
                      <Route path="/my-journey" element={<MyJourney />} />
                      <Route path="/couples-intimacy" element={<CouplesIntimacy />} />
                      <Route path="/mastery" element={<Mastery />} />
                      <Route path="/adventures" element={<Adventures />} />
                      <Route path="/audio-guides" element={<AudioGuides />} />
                      <Route path="/nexo-guide" element={<NexoGuide />} />
                      <Route path="/pairing" element={<PairingPage />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </NotificationProvider>
            </PassportProvider>
          </EmpathyEngineProvider>
        </CoupleProvider>
      </KeysProvider>
    </Router>
  );
};

export default App;
