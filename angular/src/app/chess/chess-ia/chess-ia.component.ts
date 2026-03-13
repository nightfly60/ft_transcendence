import { Component, OnInit, OnDestroy, inject, signal, input } from '@angular/core';
import { ChessComponent } from '../chess-board/chess-board.component';
import { SocketService, GameState } from '../../services/socket.service';
import { IaLevel } from '../chess-mode-select/ia-level-modal/ia-level-modal';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chess-ia',
  standalone: true,
  imports: [ChessComponent],
  templateUrl: './chess-ia.component.html',
  styleUrls: ['./chess-ia.component.scss']
})
export class ChessIaComponent implements OnInit, OnDestroy {
	private socket = inject(SocketService);
	auth = inject(AuthService);

	level       = input<IaLevel>('intermediaire');
	gameId      = signal<string>('');
	gameState   = signal<GameState | null>(null);
	waiting     = signal<boolean>(true);
	iaThinking  = signal<boolean>(false);
	playerColor = signal<'w' | 'b'>('w');

	ngOnInit() {
		this.startGame();
	}

	private startGame() {
		this.socket.startSoloIA(this.level() as any);
		this.socket.onSoloIAReady(({ gameId, playerColor }) => {
			this.gameId.set(gameId);
			this.playerColor.set(playerColor ?? 'w');
		});
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
		this.socket.sendSoloIAMove(id, move.from, move.to, move.promotion);
	}

	onResign() {
		this.socket.offSoloIAListeners();
		this.waiting.set(true);
		this.gameState.set(null);
		this.iaThinking.set(false);
		this.playerColor.set('w');
		this.startGame();
	}

	ngOnDestroy() {
		this.socket.offSoloIAListeners();
	}
}
