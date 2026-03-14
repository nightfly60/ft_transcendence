import { Server, Socket } from 'socket.io';
import { registerMultiplayerEvents } from './multiplayer/index.js';
import { registerSoloEvents } from './solo.js';
import { registerSoloIAEvents } from './solo-ia.js';

export function registerChessEvents(io: Server, socket: Socket): void {
  console.log(`Player connected: ${socket.id}`);
  console.log("register");
  registerMultiplayerEvents(io, socket);
  registerSoloEvents(io, socket);
  registerSoloIAEvents(io, socket);
}
