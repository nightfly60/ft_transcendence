import pool from '../../../../db.js';
import { playerGames } from './state.js';
import { updateElo } from './elo.js';
import { updateXp } from './xp.js';
import { updateAchievements } from './achievements.js';

/**
 * @brief Clôture une partie : nettoie l'état en mémoire, persiste le résultat en BDD et met à jour les ELO.
 *
 * @param gameId      Identifiant de la partie.
 * @param whiteUserId Id du joueur qui avait les blancs.
 * @param blackUserId Id du joueur qui avait les noirs.
 * @param nbMoves     Nombre de coups joués dans la partie.
 * @param winnerId    Id du gagnant, ou null en cas de nulle/pat.
 */
export async function finalizeGame(
	gameId: string,
	whiteUserId: number,
	blackUserId: number,
	nbMoves: number,
	winnerId: number | null,
): Promise<void> {
	playerGames.delete(whiteUserId);
	playerGames.delete(blackUserId);
	await pool.query(
		'UPDATE Game SET id_winner = ?, nb_cuts = ? WHERE id = ?',
		[winnerId ?? null, nbMoves, Number(gameId)]
	);
	await updateElo(winnerId, whiteUserId, blackUserId);
	await updateXp(winnerId, whiteUserId, blackUserId);
	await updateAchievements(whiteUserId, winnerId, nbMoves);
	await updateAchievements(blackUserId, winnerId, nbMoves);
}
