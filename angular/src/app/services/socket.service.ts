import { Injectable } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io(`${window.location.protocol}//${window.location.host}`, {
    path: '/socket.io/',
    auth: { token: localStorage.getItem('token') ?? '' },
  });

  // ─── Multiplayer ─────────────────────────────────────────────────────────

  findGame() {
    this.socket.emit('find_game');
  }

  leaveGame(gameId: string) {
    this.socket.emit('leave_game', { gameId });
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
