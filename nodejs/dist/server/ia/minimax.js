const pieceValues = {
    p: 1, // pion
    n: 3, // cavalier
    b: 3, // fou
    r: 5, // tour
    q: 9, // dame
    k: 0, // roi -> 0 parce que infini
};
// calculer la valeur de la position en fonction du nb de pieces sur l'echequier (calcule uniquement sur l'avantage materiel)
export function evalPosition(chess) {
    let score = 0;
    const board = chess.board();
    for (const row of board) {
        for (const square of row) {
            if (!square)
                continue;
            const value = pieceValues[square.type] ?? 0;
            score += square.color === "w" ? value : -value; // soustrait ou ajoute en fonction de la couleur pour avoir la difference (ex +3 ou -3 etc)
        }
    }
    score += (Math.random() - 0.5) * 0.1;
    return score;
}
// en recursivite, on evalue la position de tous les coups, pour chaque coup, on evalue tous les coups de l'adversaire etc jusqu'a depth == 0
export function minimax(chess, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
    if (depth == 0)
        return (evalPosition(chess));
    const moves = chess.moves(); // compte le nb de coups legaux possibles
    if (moves.length === 0) // si y a aucun coup de dispo -> mat, pat / match nul
     {
        if (chess.isCheckmate())
            return isMaximizing ? -Infinity : Infinity; // mat bien ou pas en fonction de la couleur
        return 0; // pat
    }
    if (isMaximizing) // si c'est les blancs
     {
        let best = -Infinity;
        for (const move of moves) {
            chess.move(move);
            const score = minimax(chess, depth - 1, false);
            chess.undo();
            best = Math.max(best, score);
            alpha = Math.max(alpha, best);
            if (beta <= alpha)
                break;
        }
        return best;
    }
    else // si c'est les noirs
     {
        let best = Infinity;
        for (const move of moves) {
            chess.move(move);
            const score = minimax(chess, depth - 1, true);
            chess.undo();
            best = Math.min(best, score);
            beta = Math.min(beta, best);
            if (beta <= alpha)
                break;
        }
        return best;
    }
}
