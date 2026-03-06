import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerGameEvents } from './sockets/game.js';
import { registerChatEvents } from './sockets/chat.js';
import userRouter from './routes/user.js';
import profileRouter from './routes/profile.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/avatars', (req, res, next) => {
    console.log('Avatar request:', req.url);
    console.log('Looking in:', path.join(__dirname, 'public/avatars'));
    next();
}, express.static(path.join(__dirname, 'public/avatars')));

console.log('Serving avatars from:', path.join(__dirname, 'public/avatars'));

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', requireAuth, userRouter);
app.use('/profile', requireAuth, profileRouter); 

io.on('connection', (socket) => {
  //check user auth before socket creation
  socket.on('join_game', (gameId: string) => {
    socket.join(gameId);                          //add user to game room
    socket.data.gameId = gameId;                  //store gameId directly in socket
    console.log(`${socket.id} joined game ${gameId}`);
  });
  registerGameEvents(io, socket);
  registerChatEvents(io, socket);
});

app.use('/auth', authRouter);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
