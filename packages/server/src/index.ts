import { User as PrismaUser } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import prisma from './lib/prisma';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

declare global {
  namespace Express {
    interface User extends PrismaUser {}
  }
}

io.on('connection', async socket => {
  const userId = socket.handshake.query.id as string;

  socket.on(
    'pickup-request',
    async ({ donationId }: { donationId: string }) => {
      console.log('REQUEST');
      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
        include: {
          donator: true,
          ngo: true,
          pickup: true,
        },
      });

      io.emit('pickup-alert', { donation });
    }
  );
});

// const peerServer = ExpressPeerServer(server, {
//   debug: true,
// } as any);

// app.use('/peerjs', peerServer);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
