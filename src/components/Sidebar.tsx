import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HeartIcon, SparklesIcon, BookOpenIcon, UsersIcon, PuzzlePieceIcon, FireIcon, KeyIcon, MapIcon, PassportIcon, SpeakerWaveIcon, ChestIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChatBubbleOvalLeftEllipsisIcon, BodyIcon, CompassIcon, DocumentDuplicateIcon, ArrowLeftOnRectangleIcon } from './Icons';
import NotificationBell from './NotificationBell';
import { useCouple } from '../contexts/CoupleContext';

const navigationLinks = [
  { to: '/', text: 'Nexus', icon: <SparklesIcon className="w-6 h-6" /> },
  { to: '/nexo-guide', text: 'Nexo Guía', icon: <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" /> },
  { to: '/my-journey', text: 'Mi Viaje', icon: <HeartIcon className="w-6 h-6" /> },
  { to: '/couples-intimacy', text: 'En Pareja', icon: <UsersIcon className="w-6 h-6" /> },
  { to: '/adventures', text: 'Aventuras', icon: <PuzzlePieceIcon className="w-6 h-6" /> },
  { to: '/wish-chest', text: 'Cofre Deseos', icon: <ChestIcon className="w-6 h-6" /> },
  { to: '/audio-guides', text: 'Guías Sensoriales', icon: <SpeakerWaveIcon className="w-6 h-6" /> },
  { to: '/mastery', text: 'Arte Amatorio', icon: <KeyIcon className="w-6 h-6" /> },
  { to: '/desire-path', text: 'Sendero del Deseo', icon: <MapIcon className="w-6 h-6" /> },
  { to: '/passion-passport', text: 'Pasaporte Pasión', icon: <PassportIcon className="w-6 h-6" /> },
  { to: '/story-weaver', text: 'StoryWeaver AI', icon: <BookOpenIcon className="w-6 h-6" /> },
  { to: '/sex-dice', text: 'Dados Íntimos', icon: <FireIcon className="w-6 h-6" /> },
  { to: '/body-map', text: 'Mapa del Cuerpo', icon: <BodyIcon className="w-6 h-6" /> },
  { to: '/soul-mirror', text: 'Espejo del Alma', icon: <CompassIcon className="w-6 h-6" /> },
  { to: '/tandem-journal', text: 'Diario Tándem', icon: <DocumentDuplicateIcon className="w-6 h-6" /> },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const { logout } = useCouple();

  const baseLinkClasses = "flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200 ease-in-out overflow-hidden";
  const inactiveClasses = "text-brand-muted hover:bg-brand-navy hover:text-brand-light";
  const activeClasses = "bg-brand-accent text-white shadow-lg";
  
  const sortedLinks = React.useMemo(() => {
    const mainLinks = [
        { to: '/', text: 'Nexus', icon: <SparklesIcon className="w-6 h-6" /> },
        { to: '/nexo-guide', text: 'Nexo Guía', icon: <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" /> }
    ];
    const otherLinks = navigationLinks.filter(link => link.to !== '/' && link.to !== '/nexo-guide').sort((a, b) => a.text.localeCompare(b.text));
    
    return [...mainLinks, ...otherLinks];
  }, []);


  return (
    <nav className={`bg-brand-navy p-4 flex-shrink-0 flex flex-col justify-between h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div>
        <div className="text-center mb-12 mt-4 h-8 flex items-center justify-center">
            <NavLink to="/">
                <h1 className={`text-3xl font-serif font-bold text-brand-light transition-opacity duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
                    Nexus <span className="text-brand-accent">Íntimo</span>
                </h1>
                <SparklesIcon className={`w-8 h-8 mx-auto text-brand-accent transition-opacity duration-200 ${isCollapsed ? 'block' : 'hidden'}`} />
            </NavLink>
        </div>
        <ul className="space-y-3">
          {sortedLinks.map(({ to, text, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}
                title={isCollapsed ? text : ''}
              >
                {icon}
                <span className={`font-medium whitespace-nowrap ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
       <div className="text-center p-2">
            <button
               onClick={logout}
               className="w-full flex items-center justify-center space-x-4 p-3 rounded-lg transition-colors duration-200 text-brand-muted hover:bg-red-900/50 hover:text-red-300"
               title="Cerrar sesión de pareja"
           >
               <ArrowLeftOnRectangleIcon className="w-6 h-6" />
               <span className={`font-medium whitespace-nowrap ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Cerrar Sesión</span>
           </button>
           <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full flex items-center justify-center space-x-4 p-3 rounded-lg transition-colors duration-200 text-brand-muted hover:bg-brand-deep-purple hover:text-brand-light mb-4">
               {isCollapsed ? <ChevronDoubleRightIcon className="w-6 h-6" /> : <ChevronDoubleLeftIcon className="w-6 h-6" />}
           </button>
           <NotificationBell />
           <div className={`text-brand-muted text-xs mt-4 ${isCollapsed ? 'hidden' : 'block'}`}>
              <p>&copy; 2024 Nexus Íntimo</p>
              <p>Tu universo de placer y conexión.</p>
           </div>
        </div>
    </nav>
  );
};

export default Sidebar;
