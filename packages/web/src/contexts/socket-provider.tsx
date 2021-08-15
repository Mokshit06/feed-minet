import {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '../hooks/auth';

const SocketContext = createContext<MutableRefObject<Socket | null>>({
  current: null,
});

export function useSocket() {
  return useContext(SocketContext);
}

export const SocketProvider: React.FC = ({ children }) => {
  const socket = useRef<Socket | null>(null);
  const user = useUser();

  useEffect(() => {
    if (user.isAuthenticated) {
      const newSocket = io('http://localhost:5000', {
        query: { id: user.data!.id },
        secure: true,
      });

      // @ts-ignore
      window.socket = newSocket;
      socket.current = newSocket;

      return () => {
        newSocket?.close();
      };
    }

    socket.current = null;
    // @ts-ignore
    window.socket = null;
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
