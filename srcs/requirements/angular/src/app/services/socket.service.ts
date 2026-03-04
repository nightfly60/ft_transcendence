import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io('https://chess42.fr', {
    path: '/socket.io/'
  });

  joinGame(gameId: string) {
    this.socket.emit('join_game', gameId);
  }

  sendMove(gameId: string, from: string, to: string) {
    this.socket.emit('move', { gameId, from, to });
  }

  onMove(callback: (data: { from: string; to: string }) => void) {
    this.socket.on('move', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
