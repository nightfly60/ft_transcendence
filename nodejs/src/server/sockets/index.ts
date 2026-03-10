import { Server } from 'socket.io';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { registerChessEvents } from './chess.js';
import { registerChatEvents } from './chat.js';

export function initSockets(httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>): void {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    registerChessEvents(io, socket);
    registerChatEvents(io, socket);
  });
}