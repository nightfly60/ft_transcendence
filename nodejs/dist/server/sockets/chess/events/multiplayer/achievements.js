import pool from '../../../../db.js';
export async function updateAchievements(userId, winnerId, nbMoves) {
    const [[profile]] = await pool.query(`SELECT elo, xp FROM Profile WHERE id_user = ?`, [userId]);
    const [[{ totalGames }]] = await pool.query(`SELECT COUNT (*) as totalGames FROM Game WHERE id_player_one = ? or id_player_second = ?`, [userId, userId]);
    const [[{ totalWins }]] = await pool.query(`SELECT COUNT (*) as totalWins FROM Game WHERE id_winner = ?`, [userId]);
    const [achievements] = await pool.query(`SELECT a.*, ua.progression FROM Achievements a
		LEFT JOIN User_achievements ua
			ON a.id = ua.id_achievement AND ua.id_user = ?`, [userId]);
    for (const achievement of achievements) {
        let currentValue;
        switch (achievement.type) {
            case 'win':
                currentValue = totalWins;
                break;
            case 'game':
                currentValue = totalGames;
                break;
            case 'elo':
                currentValue = profile.elo;
                break;
            case 'upper_cut':
                currentValue = Math.round(nbMoves / 2 + 0.1);
                break;
            default:
                continue;
        }
        var progression = String(Math.max(currentValue, achievement.progression));
        await pool.query(`INSERT INTO User_achievements (id_user, id_achievement, progression)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE progression = VALUES(progression)`, [userId, achievement.id, progression]);
    }
}
