import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initSockets } from './sockets/index.js';
import userRouter from './routes/user.js';
import profileRouter from './routes/profile.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.routes';
import { requireAuth } from './middleware/auth.middleware.js';
import profileEditRouter from './routes/profile-edit.routes.js'
import passport from 'passport';

await import('./strategies/google');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.APP_PORT || 3000;

app.use(passport.initialize());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/avatars', (req, res, next) => {
    next();
}, express.static(path.join(__dirname, 'public/avatars')));

console.log('Serving avatars from:', path.join(__dirname, 'public/avatars'));

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/users', requireAuth, userRouter);
app.use('/profile', requireAuth, profileRouter); 
app.use('/profile-edit', profileEditRouter);

app.use('/auth', authRouter);
initSockets(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
