import { Server, Socket } from 'socket.io';
import { registerFindGame }                        from './matchmaking.js';
import { registerMove }                            from './moves.js';
import { registerResign }                          from './resign.js';
import { registerLeaveGame, registerDisconnect }   from './disconnect.js';
import { registerDraw }                            from './draw.js';

/**
 * @brief Enregistre l'ensemble des événements socket liés au mode multijoueur.
 *
 * @param io     Instance du serveur Socket.IO.
 * @param socket Socket du joueur qui vient de se connecter.
 */
export function registerMultiplayerEvents(io: Server, socket: Socket): void {
  registerFindGame(io, socket);
  registerMove(io, socket);
  registerResign(io, socket);
  registerLeaveGame(io, socket);
  registerDisconnect(io, socket);
  registerDraw(io, socket);
}
