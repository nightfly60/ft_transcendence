import pool from '../../../../db.js';

// fonction pour update l'xp
export async function updateXp( winnerId: number | null, whiteUserId: number, blackUserId: number ): Promise<void> {
	const WIN_XP  = 150;
	const LOSE_XP = 50;
	const DRAW_XP = 100;

	if (winnerId === null)
	{
		await pool.query('UPDATE Profile SET xp = xp + ? WHERE id_user = ?', [DRAW_XP, whiteUserId]);
		await pool.query('UPDATE Profile SET xp = xp + ? WHERE id_user = ?', [DRAW_XP, blackUserId]);
	}
	else
	{
		const loserId = winnerId === whiteUserId ? blackUserId : whiteUserId;
		await pool.query('UPDATE Profile SET xp = xp + ? WHERE id_user = ?', [WIN_XP, winnerId]);
		await pool.query('UPDATE Profile SET xp = xp + ? WHERE id_user = ?', [LOSE_XP, loserId]);
	}
}
