import {
  Board, Piece, PieceType, PieceColor, GameStatus,
  CastlingRights, GameContext, MoveResult, DEFAULT_CONTEXT,
} from './types.js';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// ─── Board helpers ────────────────────────────────────────────────────────────

/**
 * @brief Initialise le plateau en position de départ standard.
 *
 * Place les pièces noires sur les rangées 0-1 et les pièces blanches
 * sur les rangées 6-7 selon l'ordre RNBQKBNR.
 *
 * @return Un plateau 8×8 avec toutes les pièces en position initiale.
 */
export function initBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const order: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  order.forEach((t, c) => {
    b[0][c] = { type: t, color: 'b' };
    b[7][c] = { type: t, color: 'w' };
  });
  for (let c = 0; c < 8; c++) {
    b[1][c] = { type: 'P', color: 'b' };
    b[6][c] = { type: 'P', color: 'w' };
  }
  return b;
}

/**
 * @brief Convertit des coordonnées internes en notation algébrique.
 *
 * @param r Indice de ligne (0 = rangée 8, 7 = rangée 1).
 * @param c Indice de colonne (0 = colonne a, 7 = colonne h).
 * @return La case en notation algébrique, ex. 'e1'.
 */
export function toAlgebraic(row: number, col: number): string {
  return `${FILES[col]}${8 - row}`;
}

/**
 * @brief Convertit une case en notation algébrique en coordonnées internes.
 *
 * @param sq La case en notation algébrique, ex. 'e1'.
 * @return Un tuple [ligne, colonne] correspondant à la case.
 */
export function fromAlgebraic(sq: string): [number, number] {
  return [8 - parseInt(sq[1]), FILES.indexOf(sq[0])];
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * @brief Vérifie si les coordonnées sont à l'intérieur du plateau.
 *
 * @param r Indice de ligne à tester.
 * @param c Indice de colonne à tester.
 * @return true si (r, c) est dans les limites du plateau 8×8, false sinon.
 */
function exists(r: number, c: number): boolean {
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
function isEnemy(board: Board, piece: Piece, r: number, c: number): boolean {
  return board[r][c] !== null && board[r][c]?.color !== piece.color;
}

// ─── Raw move generators ──────────────────────────────────────────────────────

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
function pawnMoves(board: Board, piece: Piece, row: number, col: number, ctx: GameContext): [number, number][] {
  const moves: [number, number][] = [];
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
function sliding(board: Board, piece: Piece, row: number, col: number, dirs: number[][]): [number, number][] {
  const moves: [number, number][] = [];
  for (const [dr, dc] of dirs) {
    let r = row + dr, c = col + dc;
    while (exists(r, c)) {
      if (board[r][c] === null) moves.push([r, c]);
      else { if (isEnemy(board, piece, r, c)) moves.push([r, c]); break; }
      r += dr; c += dc;
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
function rookMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
  return sliding(board, piece, row, col, [[0,1],[0,-1],[1,0],[-1,0]]);
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
function bishopMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
  return sliding(board, piece, row, col, [[1,1],[1,-1],[-1,1],[-1,-1]]);
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
function queenMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
  return sliding(board, piece, row, col, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
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
function knightMoves(board: Board, piece: Piece, row: number, col: number): [number, number][] {
  const moves: [number, number][] = [];
  for (const [dr, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
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
function kingMoves(board: Board, piece: Piece, row: number, col: number, ctx: GameContext): [number, number][] {
  const moves: [number, number][] = [];
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
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

// ─── Core engine ──────────────────────────────────────────────────────────────

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
export function getRawMoves(board: Board, row: number, col: number, ctx: GameContext = DEFAULT_CONTEXT): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];
  switch (piece.type) {
    case 'P': return pawnMoves(board, piece, row, col, ctx);
    case 'R': return rookMoves(board, piece, row, col);
    case 'B': return bishopMoves(board, piece, row, col);
    case 'Q': return queenMoves(board, piece, row, col);
    case 'N': return knightMoves(board, piece, row, col);
    case 'K': return kingMoves(board, piece, row, col, ctx);
  }
}

/**
 * @brief Vérifie si le roi de la couleur donnée est actuellement en échec.
 *
 * Localise le roi puis teste si une pièce adverse peut l'atteindre
 * via ses coups bruts (sans contexte : le roque et l'en passant
 * ne peuvent pas constituer un échec).
 *
 * @param board  Le plateau à analyser.
 * @param color  La couleur du roi à tester ('w' ou 'b').
 * @return true si le roi est en échec, false sinon.
 */
export function isKingInCheck(board: Board, color: PieceColor): boolean {
  let kingR = -1, kingC = -1;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === 'K' && board[r][c]?.color === color)
        { kingR = r; kingC = c; }
  const enemy: PieceColor = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === enemy)
        if (getRawMoves(board, r, c).some(([ar, ac]) => ar === kingR && ac === kingC))
          return true;
  return false;
}

/**
 * @brief Simule un coup sur une copie du plateau sans modifier l'original.
 *
 * Déplace la pièce de (fromR, fromC) vers (toR, toC) et gère les cas
 * spéciaux : prise en passant (supprime le pion capturé sur sa vraie case)
 * et roque (déplace également la tour vers sa case de destination).
 *
 * @param board Le plateau original (non modifié).
 * @param fromR Ligne de départ.
 * @param fromC Colonne de départ.
 * @param toR   Ligne de destination.
 * @param toC   Colonne de destination.
 * @param ctx   Contexte de jeu (cible en passant, droits de roque).
 * @return Un nouveau plateau reflétant le coup simulé.
 */
function simulateMove(board: Board, fromR: number, fromC: number, toR: number, toC: number, ctx: GameContext): Board {
  const sim = board.map(row => [...row]);
  const piece = sim[fromR][fromC]!;
  sim[toR][toC] = piece;
  sim[fromR][fromC] = null;
  if (piece.type === 'P' && ctx.enPassantTarget) {
    const [epR, epC] = fromAlgebraic(ctx.enPassantTarget);
    if (toR === epR && toC === epC)
      sim[piece.color === 'w' ? toR + 1 : toR - 1][toC] = null;
  }
  if (piece.type === 'K' && Math.abs(toC - fromC) === 2) {
    if (toC === 6) { sim[fromR][5] = sim[fromR][7]; sim[fromR][7] = null; }
    else           { sim[fromR][3] = sim[fromR][0]; sim[fromR][0] = null; }
  }
  return sim;
}

/**
 * @brief Retourne les coups légaux de la pièce en (row, col).
 *
 * Filtre les coups bruts selon trois règles :
 * 1. Le coup ne doit pas laisser le roi en échec.
 * 2. Pour le roque : le roi ne peut pas être en échec au moment de roquer.
 * 3. Pour le roque : le roi ne peut pas traverser une case attaquée.
 *
 * @param board Le plateau courant.
 * @param row   Ligne de la pièce.
 * @param col   Colonne de la pièce.
 * @param ctx   Contexte de jeu (défaut : DEFAULT_CONTEXT).
 * @return La liste des cases légalement atteignables.
 */
export function getValidMoves(board: Board, row: number, col: number, ctx: GameContext = DEFAULT_CONTEXT): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];
  return getRawMoves(board, row, col, ctx).filter(([tr, tc]) => {
    if (isKingInCheck(simulateMove(board, row, col, tr, tc, ctx), piece.color)) return false;
    if (piece.type === 'K' && Math.abs(tc - col) === 2) {
      if (isKingInCheck(board, piece.color)) return false;
      if (isKingInCheck(simulateMove(board, row, col, row, (col + tc) / 2, ctx), piece.color)) return false;
    }
    return true;
  });
}

/**
 * @brief Calcule le statut de la partie pour le joueur color.
 *
 * Détermine si la position est normale, en échec, en mat ou en pat
 * en combinant isKingInCheck et la recherche d'un coup légal.
 *
 * @param board Le plateau courant.
 * @param color La couleur du joueur dont c'est le tour.
 * @param ctx   Contexte de jeu (défaut : DEFAULT_CONTEXT).
 * @return 'checkmate' | 'stalemate' | 'check' | 'playing'.
 */
export function computeGameStatus(board: Board, color: PieceColor, ctx: GameContext = DEFAULT_CONTEXT): GameStatus {
  const inCheck  = isKingInCheck(board, color);
  const hasLegal = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) =>
      board[r][c]?.color === color && getValidMoves(board, r, c, ctx).length > 0
    )
  ).flat().some(Boolean);
  if (!hasLegal && inCheck) return 'checkmate';
  if (!hasLegal) return 'stalemate';
  if (inCheck) return 'check';
  return 'playing';
}

// ─── Move application ─────────────────────────────────────────────────────────

/**
 * @brief Met à jour les droits de roque après un coup.
 *
 * Révoque les droits dans les cas suivants :
 * - Le roi bouge : perd les deux roques de sa couleur.
 * - Une tour quitte son coin initial : perd le roque de ce côté.
 * - Une tour est capturée dans son coin initial : perd le roque de ce côté.
 *
 * @param rights Les droits de roque avant le coup.
 * @param fromR  Ligne de départ de la pièce jouée.
 * @param fromC  Colonne de départ de la pièce jouée.
 * @param toR    Ligne de destination de la pièce jouée.
 * @param toC    Colonne de destination de la pièce jouée.
 * @param piece  La pièce qui vient de se déplacer.
 * @return Les droits de roque mis à jour.
 */
function updateCastlingRights(
  rights: CastlingRights,
  fromR: number, fromC: number,
  toR: number, toC: number,
  piece: Piece,
): CastlingRights {
  const r = { ...rights };
  if (piece.type === 'K') {
    if (piece.color === 'w') { r.wK = false; r.wQ = false; }
    else                     { r.bK = false; r.bQ = false; }
  }
  if (piece.type === 'R') {
    if (fromR === 7 && fromC === 7) r.wK = false;
    if (fromR === 7 && fromC === 0) r.wQ = false;
    if (fromR === 0 && fromC === 7) r.bK = false;
    if (fromR === 0 && fromC === 0) r.bQ = false;
  }
  if (toR === 7 && toC === 7) r.wK = false;
  if (toR === 7 && toC === 0) r.wQ = false;
  if (toR === 0 && toC === 7) r.bK = false;
  if (toR === 0 && toC === 0) r.bQ = false;
  return r;
}

/**
 * @brief Applique un coup sur le plateau et retourne le nouvel état.
 *
 * Gère les cas spéciaux : prise en passant (supprime le pion capturé),
 * promotion (remplace le pion par la pièce choisie) et roque
 * (déplace la tour vers sa case de destination).
 *
 * @param board   Le plateau avant le coup.
 * @param fromR   Ligne de départ de la pièce.
 * @param fromC   Colonne de départ de la pièce.
 * @param toR     Ligne de destination.
 * @param toC     Colonne de destination.
 * @param options Options facultatives : pièce de promotion et contexte de jeu.
 * @return Un MoveResult contenant le nouveau plateau, la pièce capturée,
 *         la nouvelle cible en passant et les droits de roque mis à jour.
 */
export function applyMove(
  board: Board,
  fromR: number, fromC: number,
  toR: number, toC: number,
  options: { promotion?: PieceType; ctx?: GameContext } = {},
): MoveResult {
  const ctx      = options.ctx ?? DEFAULT_CONTEXT;
  const newBoard = board.map(row => [...row]);
  const piece    = newBoard[fromR][fromC]!;

  let captured: Piece | null = null;
  if (piece.type === 'P' && ctx.enPassantTarget) {
    const [epR, epC] = fromAlgebraic(ctx.enPassantTarget);
    if (toR === epR && toC === epC) {
      const capturedRow = piece.color === 'w' ? toR + 1 : toR - 1;
      captured = newBoard[capturedRow][toC];
      newBoard[capturedRow][toC] = null;
    }
  }
  captured ??= newBoard[toR][toC];

  newBoard[toR][toC] = (piece.type === 'P' && (toR === 0 || toR === 7))
    ? { type: options.promotion ?? 'Q', color: piece.color }
    : piece;
  newBoard[fromR][fromC] = null;

  if (piece.type === 'K' && Math.abs(toC - fromC) === 2) {
    if (toC === 6) { newBoard[fromR][5] = newBoard[fromR][7]; newBoard[fromR][7] = null; }
    else           { newBoard[fromR][3] = newBoard[fromR][0]; newBoard[fromR][0] = null; }
  }

  return {
    board: newBoard,
    captured,
    newEnPassantTarget: (piece.type === 'P' && Math.abs(toR - fromR) === 2)
      ? toAlgebraic((fromR + toR) / 2, toC)
      : null,
    newCastlingRights: updateCastlingRights(ctx.castlingRights, fromR, fromC, toR, toC, piece),
  };
}

/**
 * @brief Calcule la map des coups légaux pour toutes les pièces du joueur color.
 *
 * Retourne un dictionnaire dont les clés sont les cases occupées par une pièce
 * du joueur et les valeurs sont les cases légalement atteignables depuis celles-ci.
 * Utilisé par le frontend pour afficher les coups disponibles sans logique locale.
 *
 * @param board Le plateau courant.
 * @param color La couleur du joueur dont on calcule les coups.
 * @param ctx   Contexte de jeu (défaut : DEFAULT_CONTEXT).
 * @return Un objet ex. { 'e2': ['e3', 'e4'], 'g1': ['f3', 'h3'], ... }.
 */
export function computeValidMovesMap(board: Board, color: PieceColor, ctx: GameContext = DEFAULT_CONTEXT): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color) {
        const moves = getValidMoves(board, r, c, ctx);
        if (moves.length > 0)
          map[toAlgebraic(r, c)] = moves.map(([mr, mc]) => toAlgebraic(mr, mc));
      }
  return map;
}
