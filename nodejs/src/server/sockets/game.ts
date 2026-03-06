import { Server, Socket } from 'socket.io';

export function registerGameEvents(io: Server, socket: Socket): void {
  console.log(`Player connected: ${socket.id}`); //replace with game start?

  // socket.on('join_game', (gameId: string) => { //
  //   socket.join(gameId);
  //   console.log(`${socket.id} joined game ${gameId}`);
  // });

  socket.on('move', (data: { from: string; to: string }) => {
    socket.to(socket.data.gameId).emit('move', { from: data.from, to: data.to });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
}
