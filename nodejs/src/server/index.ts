import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerGameEvents } from './sockets/game.js';
import userRouter from './routes/user.js';
import profileRouter from './routes/profile.js';
import pool from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use('/users', userRouter);
app.use('/profile', profileRouter); 

io.on('connection', (socket) => {
  registerGameEvents(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
