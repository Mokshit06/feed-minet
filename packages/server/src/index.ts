import app from './app';
import { ExpressPeerServer } from 'peer';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

io.on('connection', async socket => {});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
