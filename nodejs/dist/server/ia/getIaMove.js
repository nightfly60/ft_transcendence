import { Chess } from "chess.js";
import { minimax } from "./minimax.js";
/* on regarde pour tous les coups, lequel est le meilleur */
export function getIaMove(fen, depth) {
    const chess = new Chess(fen);
    const moves = chess.moves();
    const isWhite = chess.turn() === "w";
    let bestMove = moves[0];
    let bestScore = isWhite ? -Infinity : Infinity;
    for (const move of moves) {
        chess.move(move);
        const score = minimax(chess, depth - 1, !isWhite, -Infinity, Infinity);
        chess.undo();
        if (isWhite && score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        if (!isWhite && score < bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return (bestMove);
}
