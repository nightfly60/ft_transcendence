import { Server, Socket } from 'socket.io';

export function registerGameEvents(io: Server, socket: Socket): void {
  console.log(`Player connected: ${socket.id}`);

  socket.on('join_game', (gameId: string) => {
    socket.join(gameId);
    console.log(`${socket.id} joined game ${gameId}`);
  });

  socket.on('move', (data: { gameId: string; from: string; to: string }) => {
    socket.to(data.gameId).emit('move', { from: data.from, to: data.to });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });ouerCoup($event.from, $event.to)
}
