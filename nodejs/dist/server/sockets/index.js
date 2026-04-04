import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { registerChessEvents } from './chess/events/index.js';
import { registerChatEvents } from './chat.js';
export function initSockets(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            socket.data.userId = null;
            //   console.log('[socket] connexion invité');
            return next();
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || '...');
            socket.data.userId = payload.id;
            //   console.log(`[socket] auth OK userId=${socket.data.userId}`);
            next();
        }
        catch (err) {
            //   console.log('[socket] token invalide:', err);
            next(new Error('Token invalide'));
        }
    });
    io.on('connection', (socket) => {
        // console.log(`[socket] connecté id=${socket.id} userId=${socket.data.userId}`);
        socket.join(`user:${socket.data.userId}`); //rajout de l'utilisateur a sa propre room pour les notifications personnelles
        registerChessEvents(io, socket);
        registerChatEvents(io, socket);
    });
}
