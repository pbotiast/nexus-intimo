
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './views/Home';
import StoryWeaver from './views/StoryWeaver';
import SexDice from './views/SexDice';
import MyJourney from './views/MyJourney';
import CouplesIntimacy from './views/CouplesIntimacy';
import Mastery from './views/Mastery';
import Adventures from './views/Adventures';
import DesirePath from './views/DesirePath';
import PassionPassport from './views/PassionPassport';
import AudioGuides from './views/AudioGuides';
import WishChest from './views/WishChest';
import { NotificationProvider } from './contexts/NotificationContext';
import { EmpathyEngineProvider } from './contexts/EmpathyEngineContext';
import PassportModal from './components/PassportModal';
import NexoGuide from './views/NexoGuide';
import BodyMap from './views/BodyMap';
import SoulMirror from './views/SoulMirror';
import TandemJournal from './views/TandemJournal';
import { CoupleProvider } from './contexts/CoupleContext';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <CoupleProvider>
          <EmpathyEngineProvider>
            <div className="flex min-h-screen font-sans bg-brand-deep-purple text-brand-light">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/nexo-guide" element={<NexoGuide />} />
                  <Route path="/story-weaver" element={<StoryWeaver />} />
                  <Route path="/sex-dice" element={<SexDice />} />
                  <Route path="/my-journey" element={<MyJourney />} />
                  <Route path="/couples-intimacy" element={<CouplesIntimacy />} />
                  <Route path="/adventures" element={<Adventures />} />
                  <Route path="/mastery" element={<Mastery />} />
                  <Route path="/desire-path" element={<DesirePath />} />
                  <Route path="/passion-passport" element={<PassionPassport />} />
                  <Route path="/audio-guides" element={<AudioGuides />} />
                  <Route path="/wish-chest" element={<WishChest />} />
                  <Route path="/body-map" element={<BodyMap />} />
                  <Route path="/soul-mirror" element={<SoulMirror />} />
                  <Route path="/tandem-journal" element={<TandemJournal />} />
                </Routes>
              </main>
              <PassportModal />
            </div>
          </EmpathyEngineProvider>
      </CoupleProvider>
    </NotificationProvider>
  );
};

export default App;
