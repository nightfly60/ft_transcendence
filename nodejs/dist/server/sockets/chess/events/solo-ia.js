import { makeGame, buildGameState, applyMoveToGame, parseAndValidate, toPromotionPiece } from '../game.js';
import { generateFEN } from '../fen.js';
import { getIAMove } from '../../../routes/ia.routes.js';
const soloIAGames = new Map();
/* Fonction qui va recuperer la position de la partie en FEN, faire un appel a getIAMove et jouer le coup apres l'avoir valide */
async function playIAMove(gameId, game, socket) {
    await new Promise(r => setTimeout(r, 400)); // delait pour simuler une reflexion (si besoin)
    const fen = generateFEN(game); // generation du FEN a envoyer a l'IA
    try {
        const move = await getIAMove(fen, game.iaLevel); // on appelle l'IA pour avoir un coup
        const from = move.slice(0, 2); // on recup la case de depart
        const to = move.slice(2, 4); // on recup la case d'arrivee
        const coords = parseAndValidate(socket, game, from, to, null); // on valide le coup si il est juste
        if (!coords)
            return;
        const updated = {
            ...applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, undefined),
            iaLevel: game.iaLevel,
            playerColor: game.playerColor
        }; // application du coup
        soloIAGames.set(gameId, updated);
        socket.emit('game_state', buildGameState(updated));
    }
    catch (err) {
        console.error('[soloIA] erreur playIAMove', err);
    }
}
/* Boucle sur le partie (joueur, valide coup, IA, valide coup) */
export function registerSoloIAEvents(io, socket) {
    socket.on('start_solo_ia', async (data = {}) => {
        const level = data.level ?? 'intermediaire'; // si ya pas de level, on en met un de base
        const playerColor = Math.random() < 0.5 ? 'w' : 'b'; // couleur aleatoire -> chance : 1/2
        const gameId = `ia_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; // on genere une id
        const game = {
            ...makeGame(),
            iaLevel: level,
            playerColor
        };
        soloIAGames.set(gameId, game);
        socket.join(gameId);
        socket.emit('solo_ready', { gameId, playerColor });
        socket.emit('game_state', buildGameState(game));
        if (playerColor == 'b')
            await playIAMove(gameId, game, socket); // faire jouer l'ia en premier si on joue les noirs
    });
    socket.on('solo_ia_move', async ({ gameId, from, to, promotion, }) => {
        const game = soloIAGames.get(gameId); // on recup la partie
        if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate')
            return; // elle est terminee ?
        const coords = parseAndValidate(socket, game, from, to, null);
        if (!coords)
            return;
        const updated = {
            ...applyMoveToGame(game, coords.fromR, coords.fromC, coords.toR, coords.toC, toPromotionPiece(promotion)),
            iaLevel: game.iaLevel,
            playerColor: game.playerColor
        }; // application du coup
        soloIAGames.set(gameId, updated); // update de la game pour appliquer le coup
        socket.emit('game_state', buildGameState(updated));
        if (updated.gameStatus === 'checkmate' || updated.gameStatus === 'stalemate')
            return; // est ce que la partie est finie ?
        await playIAMove(gameId, updated, socket); // on joue le coup de l'IA
    });
    socket.on('solo_resign', ({ gameId }) => {
        const game = soloIAGames.get(gameId); // on recup la partie
        if (!game || game.gameStatus === 'checkmate' || game.gameStatus === 'stalemate')
            return; // finie ??
        const resigned = {
            ...game,
            gameStatus: 'checkmate'
        };
        soloIAGames.set(gameId, resigned);
        socket.emit('game_state', buildGameState(resigned)); // on force le game status a se mettre en checkmate
    });
}
