// src/contexts/CoupleContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define la estructura de tus datos compartidos
export interface SharedData {
  desires?: string[];
  bodyMap?: { [key: string]: string };
  passport?: { [key: string]: string };
  // ... otras propiedades
}

interface CoupleContextType {
  coupleId: string | null;
  coupleData: SharedData | null;
  isLoading: boolean;
  setCoupleData: (data: SharedData) => void;
  saveData: (data: Partial<SharedData>) => Promise<void>;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider = ({ children, initialCoupleId, userId }: { children: ReactNode; initialCoupleId: string | null; userId: string; }) => {
  const [coupleId, setCoupleId] = useState(initialCoupleId);
  const [coupleData, setCoupleData] = useState<SharedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para guardar el coupleId en localStorage cuando cambia
  useEffect(() => {
    if (coupleId) {
      localStorage.setItem('nexus-couple-id', coupleId);
    }
  }, [coupleId]);
  
  // Efecto para cargar los datos iniciales de la pareja
  useEffect(() => {
    const fetchCoupleData = async () => {
      if (!coupleId) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      try {
        const response = await fetch(`/api/couples/${coupleId}`);
        if (response.ok) {
          const data = await response.json();
          setCoupleData(data.sharedData);
        } else {
            // Si no se encuentra la pareja, quizás el ID es antiguo. Limpiamos.
            localStorage.removeItem('nexus-couple-id');
            setCoupleId(null);
        }
      } catch (error) {
        console.error("Error al cargar datos de la pareja:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupleData();
  }, [coupleId]);

  // Efecto para escuchar eventos de sincronización en tiempo real (SSE)
  useEffect(() => {
    if (!coupleId) return;

    const eventSource = new EventSource(`/api/couples/${coupleId}/events`);
    
    eventSource.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === 'update') {
        console.log('Datos actualizados recibidos:', parsedData.data);
        setCoupleData(parsedData.data); // Actualiza el estado con los datos del servidor
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('Error en la conexión de EventSource:', error);
      eventSource.close();
    };

    // Limpia la conexión cuando el componente se desmonta o el coupleId cambia
    return () => {
      eventSource.close();
    };
  }, [coupleId]);

  // Función para guardar datos parciales y notificar al backend
  const saveData = async (dataToSave: Partial<SharedData>) => {
    if (!coupleId) return;

    try {
        // En lugar de enviar todo el objeto, enviamos solo el campo que cambia
        // El backend debe estar preparado para manejar esto (como en el server.ts de ejemplo)
        const endpoint = Object.keys(dataToSave)[0]; // desires, bodyMap, etc.
        const response = await fetch(`/api/couples/${coupleId}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
            throw new Error(`Error al guardar los datos en /api/couples/${coupleId}/${endpoint}`);
        }

        // El backend se encarga de enviar el evento SSE.
        // El estado local se actualizará cuando se reciba ese evento.
        // Esto asegura que la UI siempre refleje el estado "verdadero" del servidor.

    } catch (error) {
        console.error("Error al guardar datos:", error);
        // Aquí podrías mostrar una notificación de error al usuario
    }
  };

  const value = { coupleId, coupleData, isLoading, setCoupleData: setCoupleData as any, saveData };

  return (
    <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (context === undefined) {
    throw new Error('useCouple debe ser usado dentro de un CoupleProvider');
  }
  return context;
};