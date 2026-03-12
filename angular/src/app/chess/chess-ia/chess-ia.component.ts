import { Component, OnInit, OnDestroy, inject, signal, input } from '@angular/core';
import { NgIf } from '@angular/common';
import { ChessComponent } from '../chess-board/chess-board.component';
import { SocketService, GameState } from '../../services/socket.service';
import { IaLevel } from '../chess-mode-select/ia-level-modal/ia-level-modal';

@Component({
  selector: 'app-chess-ia',
  standalone: true,
  imports: [ChessComponent, NgIf],
  templateUrl: './chess-ia.component.html',
  styleUrls: ['./chess-ia.component.scss']
})
export class ChessIaComponent implements OnInit, OnDestroy {
	private socket = inject(SocketService);
	level = input<IaLevel>('intermediaire');

	gameId = signal<string>('');
	gameState = signal<GameState | null>(null);
	waiting = signal<boolean>(true);
	iaThinking = signal<boolean>(false);

	ngOnInit() {
		this.socket.startSoloIA(this.level() as any);
		this.socket.onSoloReady(({ gameId }) => this.gameId.set(gameId));
		this.socket.onGameState(state => {
			this.gameState.set(state);
			this.waiting.set(false);
			this.iaThinking.set(false);
		});
	}

	onMovePlayed(move: { from: string; to: string; promotion?: string }) {
		const id = this.gameId();
		if (!id || this.iaThinking()) return;
		this.iaThinking.set(true);
		if (id) this.socket.sendSoloIAMove(id, move.from, move.to, move.promotion);
	}

	onResign() {
		this.waiting.set(true);
		this.gameState.set(null);
	}

	ngOnDestroy() {
		this.socket.offSoloIAListeners();
	}
}
