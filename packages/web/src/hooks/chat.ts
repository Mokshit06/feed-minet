import { atom } from 'jotai';
import type { ChatRoom } from '@prisma/client';

export const selectedRoomIdAtom = atom<string | null>(null);
export const roomsAtom = atom<ChatRoom[]>([]);
export const selectedRoomAtom = atom(get => {
  const rooms = get(roomsAtom);
  const selectedRoomId = get(selectedRoomIdAtom)!;
  return rooms.find(r => r.id === selectedRoomId);
});
