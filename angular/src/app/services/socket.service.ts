import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Board, Piece, PieceColor } from '../chess/chess-board/chess.types';

export interface CastlingRights {
  wK: boolean; wQ: boolean;
  bK: boolean; bQ: boolean;
}

export interface GameState {
  board: Board;
  turn: PieceColor;
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'resign';
  moveHistory: string[];
  captured: Piece[];
  lastMove: [[number, number], [number, number]] | null;
  enPassantTarget: string | null;
  castlingRights: CastlingRights;
  validMoves: Record<string, string[]>;
}

export interface OnlineUser {
  id: number;
  username: string;
  path_img: string | null;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io(`${window.location.protocol}//${window.location.host}`, {
    path: '/socket.io/',
    auth: { token: localStorage.getItem('token') ?? '' },
  });

  // ─── Présence ─────────────────────────────────────────────────────────────

  onlineUsers = signal<OnlineUser[]>([]);

  constructor() {
    this.socket.on('online_users', ({ users }: { users: OnlineUser[] }) => {
      this.onlineUsers.set(users);
    });
    this.socket.on('user_online', (user: OnlineUser) => {
      this.onlineUsers.update(list =>
        list.some(u => u.id === user.id) ? list : [...list, user]
      );
    });
    this.socket.on('user_offline', ({ userId }: { userId: number }) => {
      this.onlineUsers.update(list => list.filter(u => u.id !== userId));
    });
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsers().some(u => u.id === userId);
  }

  // ─── Multiplayer ─────────────────────────────────────────────────────────

  findGame() {
    this.socket.emit('find_game');
  }

  leaveGame(gameId: string) {
    this.socket.emit('leave_game', { gameId });
  }

  notifyHidden() {
    this.socket.emit('player_hidden');
  }

  notifyVisible() {
    this.socket.emit('player_visible');
  }

  onWaiting(callback: () => void) {
    this.socket.on('waiting', callback);
  }

  onGameReady(callback: (data: { gameId: string; color: string; whiteUsername: string; blackUsername: string }) => void) {
    this.socket.on('game_ready', callback);
  }

  sendMove(gameId: string, from: string, to: string, promotion?: string) {
    this.socket.emit('move', { gameId, from, to, promotion });
  }

  onOpponentLeft(callback: (data: { seconds: number }) => void) {
    this.socket.on('opponent_left', callback);
  }

  onOpponentBack(callback: () => void) {
    this.socket.on('opponent_back', callback);
  }

  proposeDraw(gameId: string) { this.socket.emit('propose_draw', { gameId }); }
  acceptDraw(gameId: string)  { this.socket.emit('accept_draw',  { gameId }); }
  refuseDraw(gameId: string)  { this.socket.emit('refuse_draw',  { gameId }); }

  onDrawProposed(callback: () => void)  { this.socket.on('draw_proposed', callback); }
  onDrawRefused(callback: () => void)   { this.socket.on('draw_refused',  callback); }

  offMultiListeners() {
    this.socket.off('waiting');
    this.socket.off('game_ready');
    this.socket.off('game_state');
    this.socket.off('opponent_left');
    this.socket.off('opponent_back');
    this.socket.off('draw_proposed');
    this.socket.off('draw_refused');
  }

  // ─── Solo ─────────────────────────────────────────────────────────────────

  startSolo() {
    this.socket.emit('start_solo');
  }

  onSoloReady(callback: (data: { gameId: string }) => void) {
    this.socket.on('solo_ready', callback);
  }

  sendSoloMove(gameId: string, from: string, to: string, promotion?: string) {
    this.socket.emit('solo_move', { gameId, from, to, promotion });
  }

  onGameState(callback: (state: GameState) => void) {
    this.socket.on('game_state', callback);
  }

  resignSolo(gameId: string) {
    this.socket.emit('solo_resign', { gameId });
  }

  resignMulti(gameId: string) {
    this.socket.emit('multi_resign', { gameId });
  }

  offSoloListeners() {
    this.socket.off('solo_ready');
    this.socket.off('game_state');
  }

  // ia
	startSoloIA(level: 'novice' | 'intermediaire' | 'expert') {
		this.socket.emit('start_solo_ia', { level });
	}

	sendSoloIAMove(gameId: string, from: string, to: string, promotion?: string) {
		this.socket.emit('solo_ia_move', { gameId, from, to, promotion });
	}

	offSoloIAListeners() {
		this.socket.off('solo_ready');
		this.socket.off('game_state');
	}

	onSoloIAReady(callback: (data: { gameId: string; playerColor?: 'w' | 'b' }) => void) {
		this.socket.on('solo_ready', callback);
	}

// ─── Chat ───────────────────────────────────────────────────────────────
  
  getUser() {
    this.socket.emit('chat:get_user');
  }

  joinDmRoom(conv_id : number) {
    this.socket.emit('dm:join_room', conv_id);
    console.log('SOCKET JOIN');
  }

  onUserFound(callback : (userId : number) => void) {
    this.socket.on('chat:found_user', callback);
  }
  
  findChat() {
    this.socket.emit('chat:find');
  }

  onChatReady(callback : (chatId : string, userId : number, conversationId: number) => void) {
    this.socket.on('chat:ready', callback);
  }

  sendMessage(chatId : string, message : string, conv_id: number) {
    this.socket.emit('chat:send', ({ chatId, message, conv_id }));
  }

  onReceiveMessage(callback : (data : { id : number, text: string; senderId: number; timestamp: Date, conv_id: number}) => void) {
    this.socket.on('chat:receive', callback);
  }

  // ─── Common ───────────────────────────────────────────────────────────────

  reconnect(token: string) {
    this.socket.disconnect();
    this.socket.auth = { token };
    this.socket.connect();
  }
  
  disconnect() {
    this.socket.disconnect();
  }
}
