import { createServer } from 'http';
import { ExpressPeerServer } from 'peer';
import { Server } from 'socket.io';
import app from './app';
import prisma from './lib/prisma';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
} as any);

app.use('/peerjs', peerServer);

io.on('connection', async socket => {
  const userId = socket.handshake.query.id as string;

  socket.on('rooms:fetch', async () => {
    const rooms = await prisma.user
      .findUnique({
        where: { id: userId },
      })
      .chatRooms();

    socket.emit('rooms:render', { rooms });
  });

  socket.on(
    'rooms:create',
    async ({ participantIds }: { participantIds: string[] }) => {
      await prisma.chatRoom.create({
        data: {
          particpants: {
            connect: participantIds.map(id => ({ id })),
          },
        },
        include: {
          particpants: true,
        },
      });

      const rooms = await prisma.user
        .findUnique({
          where: { id: userId },
        })
        .chatRooms();

      socket.emit('rooms:render', { rooms });
    }
  );

  socket.on('room:join', async ({ roomId }: { roomId: string }) => {
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        particpants: true,
        messages: true,
      },
    });

    // TODO subscribe to multiple rooms
    socket.join(roomId);

    socket.emit('room:joined', {
      room,
    });
  });

  socket.on('room:disconnected', ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
  });

  socket.on(
    'message:send',
    async ({
      text,
      roomId,
      senderId,
    }: {
      text: string;
      roomId: string;
      senderId: string;
    }) => {
      const message = await prisma.message.create({
        data: {
          text,
          senderId,
          roomId,
        },
        include: {
          sender: true,
        },
      });

      io.in(roomId).emit('message:receive', { message, roomId });
    }
  );
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
