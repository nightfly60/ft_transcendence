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

  findChat() {
    this.socket.emit('chat:find');
  }

  onChatReady(callback : (chatId : string) => void) {
    this.socket.on('chat:ready', callback);
  }

  sendMessage(chatId : string, message : string) {
    this.socket.emit('chat:send', ({ chatId, message }));
  }

  // onReceiveMessage(msg : { text: string, sender: string, sentAt: string}) {
  //   this.socket.emit('chat:receive,', msg);
  // }
  onReceiveMessage(callback : (data : { text: string; sender: string; timestamp: Date}) => void) {
    this.socket.on('chat:receive', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
