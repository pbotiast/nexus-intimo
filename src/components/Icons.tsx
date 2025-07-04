// src/components/Icons.tsx

import React from 'react';

// Iconos existentes...
export const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.672-2.672L11.25 18l1.938-.648a3.375 3.375 0 002.672-2.672L16.25 13.5l.648 1.938a3.375 3.375 0 002.672 2.672L21 18.75l-1.938.648a3.375 3.375 0 00-2.672 2.672z" />
    </svg>
);

export const BookmarkSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H7.5A2.25 2.25 0 005.25 6v13.5A2.25 2.25 0 007.5 21.75h9a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0016.5 3.75z" />
    </svg>
);

// --- NUEVOS ICONOS AÑADIDOS ---

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export const LocationMarkerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);
export const ThumbUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2.25 2.25 0 012.236 1.95l-1.267 6.334A2.25 2.25 0 0117.234 21H5.25a2.25 2.25 0 01-2.25-2.25V10.5A2.25 2.25 0 015.25 8.25h1.5a.75.75 0 01.75.75v5.25a.75.75 0 01-.75.75H5.25m9-9.75l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const ThumbDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2.25 2.25 0 01-2.236-1.95l1.267-6.334A2.25 2.25 0 016.766 3h10.468a2.25 2.25 0 012.236 1.95l-1.267 6.334A2.25 2.25 0 0117.234 13H14m-4 0v5.25a.75.75 0 00.75.75h1.5a.75.75 0 00.75-.75V14m-3-9.75l3 3m0 0l3-3m-3 3V3" />
    </svg>
);

export const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12A6 6 0 0112 6z" />
    </svg>
);

export const HeartBrokenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75l-1.5-1.5a8.25 8.25 0 01-11.25-11.25l1.5-1.5m12 12l1.5 1.5a8.25 8.25 0 0011.25-11.25l-1.5-1.5m-12-12l1.5-1.5a8.25 8.25 0 0111.25 11.25l-1.5 1.5M9 15l6-6m0 6l-6-6" />
    </svg>
);

export const CubeIconFilled: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 9v10l10 5 10-5V9L12 14l-10-5z" />
    </svg>
);

export const CubeIconOutline: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 9v10l10 5 10-5V9L12 14l-10-5z" />
    </svg>
);
export const CubeIconSolid: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 9v10l10 5 10-5V9L12 14l-10-5z" />
    </svg>
);
export const CubeIconOutlineFilled: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 9v10l10 5 10-5V9L12 14l-10-5z" />
    </svg>
);
export const CubeIconOutlineSolid: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 9v10l10 5 10-5V9L12 14l-10-5z" />
    </svg>
);
export const CubeIconOutlineFilledSolid: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 9v10l10 5 10-5V9L12 14l-10-5z" />
    </svg>
);

export const CubeIconSolidFilled: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 9v10l10 5 10-5V9L12 14l-10-5z" />
    </svg>
);
export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.5M4.75 6.253L2.25 5.5v13l2.5.753m14.5-13.753L21.75 5.5v13l-2.5.753M4.75 6.253V18.5m14.5-12.247V18.5" />
    </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H9v-2.625a4 4 0 014-4h.25a4 4 0 014 4V21zM21 21v-2.625a4 4 0 00-4-4h-1.25" />
    </svg>
);

export const PuzzlePieceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5-7.5-7.5 7.5-7.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l-3.75 3.75" />
    </svg>
);

export const FireIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6c0 1.591-1.343 2.88-3 2.88S3 11.191 3 9.6c0-1.591 1.343-2.88 3-2.88.318 0 .622.05.914.143a8.25 8.25 0 019.448-2.629z" />
    </svg>
);

export const MapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-6V4m0 3l6-3m0 0l6 3m-6-3v6m6 3l-6 3m0 0l-6-3m6 3v6" />
    </svg>
);

export const PassportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5v15H3.75v-15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15h4.5" />
    </svg>
);

export const SpeakerWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.5-5.656-5.224 2.19L13.684 16.6zm0 0l2.19-5.224L16.6 13.684 13.684 16.6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.071 4.929c3.905 3.905 3.905 10.237 0 14.142M4.929 19.071c-3.905-3.905-3.905-10.237 0-14.142" />
    </svg>
);

export const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-7.5 7.5a1.5 1.5 0 000 2.121l7.5 7.5a1.5 1.5 0 002.121 0l7.5-7.5a1.5 1.5 0 000-2.121l-7.5-7.5a1.5 1.5 0 00-2.121 0z" />
    </svg>
);

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a3.375 3.375 0 01-3.375-3.375V9.375a3.375 3.375 0 013.375-3.375h9a3.375 3.375 0 013.375 3.375v6a3.375 3.375 0 01-3.375 3.375z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-2.25m7.5 2.25v-2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V9.375c0-1.864.166-3.56.458-5.124" />
    </svg>
);

export const ChestIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const BodyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.083 4.5A6.962 6.962 0 0012 3c-1.892 0-3.62.755-4.883 1.987M18.75 9.75c.359.7.563 1.48.563 2.25 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-.77.204-1.55.563-2.25" />
    </svg>
);

export const CompassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-7-8h1m16 0h1M5.636 5.636l.707.707m12.02 12.02l.707.707M5.636 18.364l.707-.707m12.02-12.02l.707-.707" />
    </svg>
);

export const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);  

