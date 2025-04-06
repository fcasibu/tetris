'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SocketClientService } from '../services/socket-client-service';

const SocketClientContext = createContext<SocketClientService | null>(null);

export function useSocketClient() {
  const ctx = useContext(SocketClientContext);

  if (!ctx) {
    throw new Error(
      'useSocketClient must be used within a SocketClientProvider',
    );
  }

  return ctx;
}

const socketInstance = SocketClientService.getInstance();

export function SocketClientProvider({ children }: React.PropsWithChildren) {
  const [connected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsub = socketInstance.initializeConnectListener(() => {
      setIsConnected(true);
    });

    return () => {
      unsub();
      socketInstance.leaveRoom(
        socketInstance.getRoomIdOfSelf()!,
        socketInstance.getRoomIdOfSelf()!,
      );
    };
  }, []);

  if (!connected) return null;

  return (
    <SocketClientContext.Provider value={socketInstance}>
      {children}
    </SocketClientContext.Provider>
  );
}
