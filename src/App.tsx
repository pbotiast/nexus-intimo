// src/App.tsx
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './views/Home';
import { CouplesIntimacy } from './views/CouplesIntimacy';
import { MyJourney } from './views/MyJourney';
import { NexoGuide } from './views/NexoGuide';
import { PassionPassport } from './views/PassionPassport';
import { Mastery } from './views/Mastery';
import { Adventures } from './views/Adventures';
import { SexDice } from './views/SexDice';
import { WishChest } from './views/WishChest';
import { TandemJournal } from './views/TandemJournal';
import { SoulMirror } from './views/SoulMirror';
import { StoryWeaver } from './views/StoryWeaver';
import { AudioGuides } from './views/AudioGuides';
import { BodyMapPage } from './pages/BodyMapPage';
import { DesiresPage } from './pages/DesiresPage';
import { PairingPage } from './views/PairingPage'; // Página de emparejamiento
import { ModalProvider } from './contexts/ModalContext';
import { CoupleProvider, useCouple } from './contexts/CoupleContext'; // Importar useCouple
import { PassportProvider } from './contexts/PassportContext';
import { KeysProvider } from './contexts/KeysContext';
import { EmpathyEngineProvider } from './contexts/EmpathyEngineContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Importar AuthProvider y useAuth
import { PairingModal } from './components/PairingModal'; // Importar el modal de emparejamiento
import { Loader } from './components/Loader'; // Importar el componente Loader

// Componente Wrapper para la lógica de enrutamiento y estado de la pareja
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { coupleId, loading: coupleLoading, error: coupleError } = useCouple(); // Obtener coupleId y loading de useCouple
  const { user, loading: authLoading, signInAnon } = useAuth(); // Obtener user y loading de useAuth

  // Controlar el modal de emparejamiento
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

  // Efecto para abrir el modal de emparejamiento si no hay coupleId y el usuario está autenticado
  React.useEffect(() => {
    if (!authLoading && !user) {
      // Si no hay usuario, intentar autenticación anónima
      signInAnon();
    } else if (!authLoading && user && !coupleId && !coupleLoading) {
      // Si hay usuario (autenticado o anónimo) pero no hay pareja y no está cargando la pareja
      setIsPairingModalOpen(true);
    } else if (coupleId && isPairingModalOpen) {
      // Si ya hay pareja, cerrar el modal de emparejamiento
      setIsPairingModalOpen(false);
    }
  }, [user, authLoading, coupleId, coupleLoading, signInAnon, isPairingModalOpen]);


  const renderPage = () => {
    // Si estamos cargando la autenticación o la pareja, mostrar un loader
    if (authLoading || coupleLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-brand-dark">
          <Loader />
        </div>
      );
    }

    // Si no hay pareja, pero el usuario está autenticado, la lógica del useEffect abrirá el modal
    if (!coupleId) {
      // Podríamos mostrar una página de "Bienvenida" o "Empieza aquí" si el modal no fuera suficiente
      return (
        <div className="flex items-center justify-center h-screen bg-brand-dark text-brand-light">
          <p>Por favor, crea o únete a una pareja para continuar.</p>
        </div>
      );
    }

    // Si hay un error en la pareja, mostrarlo
    if (coupleError) {
      return (
        <div className="flex items-center justify-center h-screen bg-brand-dark text-red-500">
          <p>Error: {coupleError}</p>
        </div>
      );
    }

    // Renderizar la página actual si hay pareja
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'couples-intimacy':
        return <CouplesIntimacy />;
      case 'my-journey':
        return <MyJourney />;
      case 'nexoguide':
        return <NexoGuide />;
      case 'passion-passport':
        return <PassionPassport />;
      case 'mastery':
        return <Mastery />;
      case 'adventures':
        return <Adventures />;
      case 'sexdice':
        return <SexDice />;
      case 'wishchest':
        return <WishChest />;
      case 'tandemjournal':
        return <TandemJournal />;
      case 'soulmirror':
        return <SoulMirror />;
      case 'storyweaver':
        return <StoryWeaver />;
      case 'audioguides':
        return <AudioGuides />;
      case 'bodymap':
        return <BodyMapPage />;
      case 'desires':
        return <DesiresPage />;
      case 'pairing':
        return <PairingPage />; // Esta página ya no debería ser necesaria si el modal lo maneja
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-dark font-sans text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} setCurrentPage={setCurrentPage} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {renderPage()}
      </div>
      {/* El modal de emparejamiento se muestra condicionalmente */}
      <PairingModal isOpen={isPairingModalOpen} onClose={() => setIsPairingModalOpen(false)} />
    </div>
  );
};

// Componente principal que envuelve toda la aplicación con los contextos
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ModalProvider>
        <CoupleProvider>
          <PassportProvider>
            <KeysProvider>
              <EmpathyEngineProvider>
                <NotificationProvider>
                  <AppContent />
                </NotificationProvider>
              </EmpathyEngineProvider>
            </KeysProvider>
          </PassportProvider>
        </CoupleProvider>
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
