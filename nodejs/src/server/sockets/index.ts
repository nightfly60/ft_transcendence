import { Server } from 'socket.io';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { registerGameEvents } from './game.js';

export function initSockets(httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>): void {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    registerGameEvents(io, socket);
  });
}