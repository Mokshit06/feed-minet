import { atom, useAtom } from 'jotai';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useUser } from './auth';
import { useCallback } from 'react';

export const socketAtom = atom<Socket | null>(null);

export function useSocket() {
  const user = useUser();
  const [socket, setSocket] = useAtom(socketAtom);

  const connect = useCallback(() => {
    if (!user.isAuthenticated) {
      setSocket(null);
      return;
    }

    const newSocket = io('http://localhost:5000', {
      query: { id: user.data?.id || '' },
      secure: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, setSocket]);

  return { socket, connect };
}
