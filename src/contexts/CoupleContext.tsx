// src/contexts/CoupleContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CoupleData } from '../types';
import { createCoupleApiCall, joinCoupleApiCall, getCoupleDataApiCall, leaveCoupleApiCall } from '../services/api';
import { useAuth } from './AuthContext'; // Importar el hook de autenticación

interface CoupleContextType {
  coupleId: string | null;
  coupleData: CoupleData | null;
  pairingCode: string | null;
  loading: boolean;
  error: string | null;
  createCouple: () => Promise<{ coupleId: string; pairingCode: string } | undefined>;
  joinCouple: (code: string) => Promise<boolean>;
  leaveCouple: () => Promise<void>;
  updateCoupleData: (newData: Partial<CoupleData>) => Promise<void>;
  // Puedes añadir funciones para actualizar datos específicos como desires, bodymap
  updateDesires: (desires: string[]) => Promise<void>;
  updateBodyMap: (bodyMap: { [key: string]: string }) => Promise<void>;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

interface CoupleProviderProps {
  children: ReactNode;
}

export const CoupleProvider: React.FC<CoupleProviderProps> = ({ children }) => {
  const { user, loading: authLoading, auth } = useAuth(); // Obtener el usuario autenticado y el estado de carga de AuthContext
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [coupleData, setCoupleData] = useState<CoupleData | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar el coupleId desde localStorage al inicio
  useEffect(() => {
    const storedCoupleId = localStorage.getItem('coupleId');
    if (storedCoupleId) {
      setCoupleId(storedCoupleId);
    }
    setLoading(false); // Finaliza la carga inicial del estado de la pareja
  }, []);

  // Efecto para sincronizar datos de la pareja y SSE
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToSSE = async (currentCoupleId: string, idToken: string) => {
      // Asegurarse de que el token se envía con la conexión SSE si es necesario para autenticación
      // Aunque SSE es GET, si el backend requiere autenticación, el token debería ir en el header
      // o como query param (menos seguro). Nuestro server.ts no lo requiere para SSE, pero sí para datos.
      eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/api/couples/${currentCoupleId}/events`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'update') {
            console.log('Datos de pareja actualizados vía SSE:', data.data);
            setCoupleData(data.data);
          } else if (data.type === 'message') {
            console.log('Mensaje SSE:', data.message);
            // Puedes manejar otros tipos de mensajes aquí, como notificaciones
          }
        } catch (e) {
          console.error("Error parsing SSE message:", e);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        eventSource?.close();
        // Reintentar conexión después de un tiempo
        setTimeout(() => {
          if (coupleId) connectToSSE(coupleId, idToken); // Reintentar con el token actual
        }, 5000);
      };
    };

    const fetchData = async () => {
      if (coupleId && user && !authLoading) { // Solo si hay coupleId y el usuario está autenticado y no cargando
        setLoading(true);
        setError(null);
        try {
          const idToken = await user.getIdToken(); // Obtener el token de ID de Firebase
          const data = await getCoupleDataApiCall(coupleId, idToken);
          setCoupleData(data);
          connectToSSE(coupleId, idToken); // Conectar a SSE
        } catch (err: any) {
          console.error("Error fetching couple data:", err);
          setError(err.message || "Error al cargar los datos de la pareja.");
          // Si hay un error al cargar los datos, limpiar coupleId para forzar re-emparejamiento
          localStorage.removeItem('coupleId');
          setCoupleId(null);
          setCoupleData(null);
        } finally {
          setLoading(false);
        }
      } else if (!coupleId && !authLoading) {
        setLoading(false); // Si no hay coupleId y auth está listo, no hay carga
      }
    };

    // Solo ejecutar si el usuario está listo (autenticado o anónimo) y no está cargando el auth
    if (!authLoading) {
      fetchData();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("EventSource cerrado.");
      }
    };
  }, [coupleId, user, authLoading]); // Dependencias: coupleId, user (para idToken), authLoading

  const createCouple = useCallback(async () => {
    if (!user) {
      setError("Debes estar autenticado para crear una pareja.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await createCoupleApiCall(idToken); // Pasa el token
      setCoupleId(response.coupleId);
      setPairingCode(response.pairingCode);
      localStorage.setItem('coupleId', response.coupleId);
      // No necesitamos setCoupleData aquí, el useEffect de SSE lo manejará
      return response;
    } catch (err: any) {
      console.error("Error creating couple:", err);
      setError(err.message || "Error al crear la pareja.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const joinCouple = useCallback(async (code: string) => {
    if (!user) {
      setError("Debes estar autenticado para unirte a una pareja.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await joinCoupleApiCall(code, idToken); // Pasa el token
      setCoupleId(response.coupleId);
      setCoupleData(response.coupleData);
      localStorage.setItem('coupleId', response.coupleId);
      return true;
    } catch (err: any) {
      console.error("Error joining couple:", err);
      setError(err.message || "Error al unirse a la pareja.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const leaveCouple = useCallback(async () => {
    if (!coupleId || !user) {
      setError("No hay pareja para abandonar o no estás autenticado.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      await leaveCoupleApiCall(coupleId, idToken);
      localStorage.removeItem('coupleId');
      setCoupleId(null);
      setCoupleData(null);
      setPairingCode(null);
    } catch (err: any) {
      console.error("Error leaving couple:", err);
      setError(err.message || "Error al abandonar la pareja.");
    } finally {
      setLoading(false);
    }
  }, [coupleId, user]);

  const updateCoupleData = useCallback(async (newData: Partial<CoupleData>) => {
    if (!coupleId || !user) {
      setError("No hay pareja activa o no estás autenticado para actualizar datos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      // Esta función genérica no se usa directamente en el API,
      // pero sirve como un patrón si tuvieras una ruta /api/couples/:id/update-data
      // Por ahora, usamos las específicas como updateDesires.
      // await updateCoupleDataApiCall(coupleId, newData, idToken);
      // setCoupleData(prev => ({ ...prev!, ...newData })); // Optimistic update
    } catch (err: any) {
      console.error("Error updating couple data:", err);
      setError(err.message || "Error al actualizar los datos de la pareja.");
    } finally {
      setLoading(false);
    }
  }, [coupleId, user]);

  const updateDesires = useCallback(async (desires: string[]) => {
    if (!coupleId || !user) {
      setError("No hay pareja activa o no estás autenticado para actualizar deseos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const updated = await createCoupleApiCall(idToken, { desires }); // Reutilizar la llamada a la API
      setCoupleData(prev => ({ ...prev!, desires })); // Actualización optimista
      // El SSE eventualmente confirmará esto
    } catch (err: any) {
      console.error("Error updating desires:", err);
      setError(err.message || "Error al actualizar los deseos.");
    } finally {
      setLoading(false);
    }
  }, [coupleId, user]);

  const updateBodyMap = useCallback(async (bodyMap: { [key: string]: string }) => {
    if (!coupleId || !user) {
      setError("No hay pareja activa o no estás autenticado para actualizar el body map.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const updated = await createCoupleApiCall(idToken, { bodyMap }); // Reutilizar la llamada a la API
      setCoupleData(prev => ({ ...prev!, bodyMap })); // Actualización optimista
      // El SSE eventualmente confirmará esto
    } catch (err: any) {
      console.error("Error updating body map:", err);
      setError(err.message || "Error al actualizar el body map.");
    } finally {
      setLoading(false);
    }
  }, [coupleId, user]);


  const value = {
    coupleId,
    coupleData,
    pairingCode,
    loading: loading || authLoading, // Considerar el loading de auth también
    error,
    createCouple,
    joinCouple,
    leaveCouple,
    updateCoupleData,
    updateDesires,
    updateBodyMap,
  };

  return (
    <CoupleContext.Provider value={value}>
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (context === undefined) {
    throw new Error('useCouple debe ser usado dentro de un CoupleProvider');
  }
  return context;
};
