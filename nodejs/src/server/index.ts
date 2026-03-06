import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerGameEvents } from './sockets/game.js';
import authRouter from './routes/auth.routes';
import { requireAuth } from './middleware/auth.middleware.js';

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

io.on('connection', (socket) => {
  registerGameEvents(io, socket);
});

app.use('/auth', authRouter);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
