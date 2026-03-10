import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io('https://chess42.fr', {
    path: '/socket.io/'
  });

  findGame() {
    this.socket.emit('find_game');
  }

  onWaiting(callback: () => void) {
    this.socket.on('waiting', callback);
  }

  onGameReady(callback: (data: { gameId: string; color: string }) => void) {
    this.socket.on('game_ready', callback);
  }

  sendMove(gameId: string, from: string, to: string) {
    this.socket.emit('move', { gameId, from, to });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
