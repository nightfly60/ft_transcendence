import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';


let waitingPlayer: string | null = null;
const games = new Map<string, { white: string; black: string }>();


export function registerChessEvents(io: Server, socket: Socket): void {
  console.log(`Player connected: ${socket.id}`);

  socket.on('find_game', () => {

    if (waitingPlayer && waitingPlayer !== socket.id) {
      const [white, black] = Math.random() < 0.5
        ? [waitingPlayer, socket.id]
        : [socket.id, waitingPlayer];

      const gameId = randomUUID();
      games.set(gameId, { white, black });
      io.sockets.sockets.get(white)?.join(gameId);
      io.sockets.sockets.get(black)?.join(gameId);
      io.to(white).emit('game_ready', { gameId, color: 'w' });
      io.to(black).emit('game_ready', { gameId, color: 'b' });
      waitingPlayer = null;
    } else {
      waitingPlayer = socket.id;
      socket.emit('waiting');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
}
