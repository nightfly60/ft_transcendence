import { Server, Socket } from 'socket.io';
import { registerMultiplayerEvents } from './multiplayer.js';
import { registerSoloEvents } from './solo.js';

export function registerChessEvents(io: Server, socket: Socket): void {
  console.log(`Player connected: ${socket.id}`);
  registerMultiplayerEvents(io, socket);
  registerSoloEvents(io, socket);
}
