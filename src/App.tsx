// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CoupleProvider } from './contexts/CoupleContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModalProvider } from './contexts/ModalContext'; // Importar
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import PairingPage from './pages/PairingPage';
import BodyMapPage from './pages/BodyMapPage';
import DesiresPage from './pages/DesiresPage';
import StoriesPage from './pages/StoriesPage';
import GamesPage from './pages/GamesPage';

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem('nexus-user-id');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('nexus-user-id', storedUserId);
    }
    setUserId(storedUserId);

    const storedCoupleId = localStorage.getItem('nexus-couple-id');
    if (storedCoupleId) {
      setCoupleId(storedCoupleId);
    }
  }, []);

  if (!userId) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <NotificationProvider>
        <CoupleProvider initialCoupleId={coupleId} userId={userId}>
          <ModalProvider> {/* Envolver con ModalProvider */}
            <Routes>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/pairing" element={<PairingPage userId={userId} setCoupleId={setCoupleId} />} />
              
              {coupleId ? (
                <>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/body-map" element={<BodyMapPage />} />
                  <Route path="/desires" element={<DesiresPage />} />
                  <Route path="/stories" element={<StoriesPage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </>
              ) : (
                <Route path="*" element={<Navigate to="/onboarding" />} />
              )}
            </Routes>
          </ModalProvider>
        </CoupleProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;