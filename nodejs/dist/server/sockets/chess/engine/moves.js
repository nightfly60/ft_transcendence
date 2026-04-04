import { DEFAULT_CONTEXT } from '../types.js';
import { fromAlgebraic } from './board.js';
/**
 * @brief Vérifie si les coordonnées sont à l'intérieur du plateau.
 *
 * @param r Indice de ligne à tester.
 * @param c Indice de colonne à tester.
 * @return true si (r, c) est dans les limites du plateau 8×8, false sinon.
 */
function exists(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}
/**
 * @brief Vérifie si la case (r, c) contient une pièce adverse.
 *
 * @param board Le plateau courant.
 * @param piece La pièce de référence dont on veut tester l'adversité.
 * @param r     Indice de ligne de la case cible.
 * @param c     Indice de colonne de la case cible.
 * @return true si la case est occupée par une pièce de couleur opposée.
 */
function isEnemy(board, piece, r, c) {
    return board[r][c] !== null && board[r][c]?.color !== piece.color;
}
/**
 * @brief Calcule les déplacements possibles d'un pion.
 *
 * Inclut : avance d'une case, avance de deux cases depuis la rangée de départ,
 * captures diagonales et prise en passant si ctx.enPassantTarget est défini.
 *
 * @param board Le plateau courant.
 * @param piece Le pion à déplacer.
 * @param row   Ligne actuelle du pion.
 * @param col   Colonne actuelle du pion.
 * @param ctx   Contexte de jeu (droits de roque, cible en passant).
 * @return La liste des cases atteignables (coups bruts, sans filtrage d'auto-échec).
 */
function pawnMoves(board, piece, row, col, ctx) {
    const moves = [];
    const dir = piece.color === 'w' ? -1 : 1;
    const startRow = piece.color === 'w' ? 6 : 1;
    if (exists(row + dir, col) && board[row + dir][col] === null) {
        moves.push([row + dir, col]);
        if (row === startRow && board[row + 2 * dir][col] === null)
            moves.push([row + 2 * dir, col]);
    }
    for (const dc of [-1, 1]) {
        if (exists(row + dir, col + dc) && isEnemy(board, piece, row + dir, col + dc))
            moves.push([row + dir, col + dc]);
    }
    if (ctx.enPassantTarget) {
        const [epR, epC] = fromAlgebraic(ctx.enPassantTarget);
        if (epR === row + dir && (epC === col - 1 || epC === col + 1))
            moves.push([epR, epC]);
    }
    return moves;
}
/**
 * @brief Génère les coups de glissement dans les directions données.
 *
 * Avance case par case dans chaque direction jusqu'à rencontrer le bord,
 * une pièce alliée (exclue) ou une pièce adverse (incluse puis arrêt).
 * Utilisé par rookMoves, bishopMoves et queenMoves.
 *
 * @param board Le plateau courant.
 * @param piece La pièce glissante.
 * @param row   Ligne de départ.
 * @param col   Colonne de départ.
 * @param dirs  Tableau de vecteurs de direction [dr, dc].
 * @return La liste des cases atteignables.
 */
function sliding(board, piece, row, col, dirs) {
    const moves = [];
    for (const [dr, dc] of dirs) {
        let r = row + dr, c = col + dc;
        while (exists(r, c)) {
            if (board[r][c] === null)
                moves.push([r, c]);
            else {
                if (isEnemy(board, piece, r, c))
                    moves.push([r, c]);
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}
/**
 * @brief Calcule les déplacements possibles d'une tour.
 *
 * Glisse horizontalement et verticalement jusqu'à obstacle.
 *
 * @param board Le plateau courant.
 * @param piece La tour à déplacer.
 * @param row   Ligne actuelle de la tour.
 * @param col   Colonne actuelle de la tour.
 * @return La liste des cases atteignables.
 */
function rookMoves(board, piece, row, col) {
    return sliding(board, piece, row, col, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
}
/**
 * @brief Calcule les déplacements possibles d'un fou.
 *
 * Glisse en diagonale jusqu'à obstacle.
 *
 * @param board Le plateau courant.
 * @param piece Le fou à déplacer.
 * @param row   Ligne actuelle du fou.
 * @param col   Colonne actuelle du fou.
 * @return La liste des cases atteignables.
 */
function bishopMoves(board, piece, row, col) {
    return sliding(board, piece, row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
}
/**
 * @brief Calcule les déplacements possibles d'une dame.
 *
 * Combine les mouvements de la tour (horizontal/vertical)
 * et du fou (diagonal) jusqu'à obstacle.
 *
 * @param board Le plateau courant.
 * @param piece La dame à déplacer.
 * @param row   Ligne actuelle de la dame.
 * @param col   Colonne actuelle de la dame.
 * @return La liste des cases atteignables.
 */
function queenMoves(board, piece, row, col) {
    return sliding(board, piece, row, col, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
}
/**
 * @brief Calcule les déplacements possibles d'un cavalier.
 *
 * Effectue les 8 sauts en L possibles (±1/±2 et ±2/±1).
 * Peut sauter par-dessus les pièces intermédiaires.
 *
 * @param board Le plateau courant.
 * @param piece Le cavalier à déplacer.
 * @param row   Ligne actuelle du cavalier.
 * @param col   Colonne actuelle du cavalier.
 * @return La liste des cases atteignables.
 */
function knightMoves(board, piece, row, col) {
    const moves = [];
    for (const [dr, dc] of [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]) {
        const r = row + dr, c = col + dc;
        if (exists(r, c) && (board[r][c] === null || isEnemy(board, piece, r, c)))
            moves.push([r, c]);
    }
    return moves;
}
/**
 * @brief Calcule les déplacements possibles d'un roi.
 *
 * Inclut les 8 cases adjacentes ainsi que le petit et le grand roque
 * si les conditions structurelles sont réunies (cases libres, tour présente,
 * droits non révoqués). La vérification "ne pas traverser l'échec" est
 * effectuée a posteriori dans getValidMoves.
 *
 * @param board Le plateau courant.
 * @param piece Le roi à déplacer.
 * @param row   Ligne actuelle du roi.
 * @param col   Colonne actuelle du roi.
 * @param ctx   Contexte de jeu contenant les droits de roque.
 * @return La liste des cases atteignables (coups bruts).
 */
function kingMoves(board, piece, row, col, ctx) {
    const moves = [];
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const r = row + dr, c = col + dc;
        if (exists(r, c) && (board[r][c] === null || isEnemy(board, piece, r, c)))
            moves.push([r, c]);
    }
    const homeRow = piece.color === 'w' ? 7 : 0;
    const rights = ctx.castlingRights;
    if (row === homeRow && col === 4) {
        const ksRight = piece.color === 'w' ? rights.wK : rights.bK;
        if (ksRight && board[homeRow][5] === null && board[homeRow][6] === null
            && board[homeRow][7]?.type === 'R' && board[homeRow][7]?.color === piece.color)
            moves.push([homeRow, 6]);
        const qsRight = piece.color === 'w' ? rights.wQ : rights.bQ;
        if (qsRight && board[homeRow][3] === null && board[homeRow][2] === null
            && board[homeRow][1] === null && board[homeRow][0]?.type === 'R'
            && board[homeRow][0]?.color === piece.color)
            moves.push([homeRow, 2]);
    }
    return moves;
}
/**
 * @brief Retourne tous les coups bruts de la pièce en (row, col).
 *
 * Délègue au générateur de coups correspondant au type de la pièce.
 * Ne filtre PAS les coups qui laisseraient le roi en échec.
 *
 * @param board Le plateau courant.
 * @param row   Ligne de la pièce.
 * @param col   Colonne de la pièce.
 * @param ctx   Contexte de jeu (défaut : DEFAULT_CONTEXT).
 * @return La liste des cases atteignables sans filtrage de légalité.
 */
export function getRawMoves(board, row, col, ctx = DEFAULT_CONTEXT) {
    const piece = board[row][col];
    if (!piece)
        return [];
    switch (piece.type) {
        case 'P': return pawnMoves(board, piece, row, col, ctx);
        case 'R': return rookMoves(board, piece, row, col);
        case 'B': return bishopMoves(board, piece, row, col);
        case 'Q': return queenMoves(board, piece, row, col);
        case 'N': return knightMoves(board, piece, row, col);
        case 'K': return kingMoves(board, piece, row, col, ctx);
    }
}
