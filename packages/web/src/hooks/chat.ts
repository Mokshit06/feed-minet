import { atom } from 'jotai';
import type { ChatRoom } from '@prisma/client';
import { useSocket } from '../contexts/socket-provider';

export const selectedRoomIdAtom = atom<string | null>(null);
export const roomsAtom = atom<ChatRoom[]>([]);
export const selectedRoomAtom = atom(get => {
  const rooms = get(roomsAtom);
  const selectedRoomId = get(selectedRoomIdAtom)!;
  return rooms.find(r => r.id === selectedRoomId);
});

export function useJoinRoom() {
  const socketRef = useSocket();

  return function joinRom(roomId: string) {
    socketRef.current?.emit('room:join', { roomId });
  };
}

export function useCreateRoom() {
  const socketRef = useSocket();

  return function createRoom(participants: string[]) {
    socketRef.current?.emit('rooms:join', {
      participantIds: participants,
    });
  };
}

export function useSendMessage() {
  const socketRef = useSocket();

  return function sendMessage({
    text,
    roomId,
  }: {
    text: string;
    roomId: string;
  }) {
    socketRef.current?.emit('message:send', {
      text,
      roomId,
    });
  };
}
