import { ChessGame, PieceType, PieceColor } from "./types.js";

const FEN_MAP: Record<PieceType, string> = {
  K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N', P: 'P'
};

export function generateFEN(game: ChessGame): string {
	let fen = '';
	for (let r = 0; r < 8; r++) {
		let empty = 0;
		for (let c = 0; c < 8; c++) {
		const piece = game.board[r][c];
		if (!piece) {
			empty++;
		} else {
			if (empty) { fen += empty; empty = 0; }
			const letter = FEN_MAP[piece.type];
			fen += piece.color === 'w' ? letter.toUpperCase() : letter.toLowerCase();
		}
		}
		if (empty) fen += empty;
		if (r !== 7) fen += '/';
	}
	fen += game.turn === 'w' ? ' w ' : ' b ';
	fen += '- - 0 1';
	return fen;
}
