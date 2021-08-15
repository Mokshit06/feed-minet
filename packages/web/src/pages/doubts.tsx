import { Flex } from '@chakra-ui/react';
import type { ChatRoom } from '@prisma/client';
import { useAtom } from 'jotai';
import Head from 'next/head';
import { useEffect } from 'react';
import { useSocket } from '../contexts/socket-provider';
import { useUser } from '../hooks/auth';
import { roomsAtom, selectedRoomAtom, selectedRoomIdAtom } from '../hooks/chat';

export default function Chat() {
  const socketRef = useSocket();
  const user = useUser();
  const [selectedRoomId, setSelectedRoomId] = useAtom(selectedRoomIdAtom);
  const [selectedRoom, setSelectedRoom] = useAtom(selectedRoomAtom);
  const [rooms, setRooms] = useAtom(roomsAtom);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('rooms:fetch');
  }, [socketRef]);

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on('rooms:render', ({ rooms }: { rooms: ChatRoom[] }) => {
      setRooms(rooms);
    });

    return () => {
      socket.off('rooms:render');
    };
  }, [socketRef, setRooms]);

  return (
    <>
      <Head>
        <title>Doubts | MINET</title>
      </Head>
      <Flex flex={1} width="full" overflow="hidden">
        <div>
          <pre>{JSON.stringify(rooms, null, 2)}</pre>
        </div>
      </Flex>
    </>
  );
}
