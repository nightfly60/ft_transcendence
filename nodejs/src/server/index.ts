import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerGameEvents } from './sockets/game.js';
import userRouter from './routes/user.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.APP_PORT || 3000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', userRouter);

io.on('connection', (socket) => {
  registerGameEvents(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
