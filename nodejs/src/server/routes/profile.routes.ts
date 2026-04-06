import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// recuperation de l'id
router.get('/:id', async (req: Request, res: Response) => {
	try
	{
		const userId = parseInt(req.params['id'] as string);
		
		if (isNaN(userId)) {
			res.status(400).json({ error: 'Invalid ID' });
			return;
		}
		
		const [username]: any = await pool.query(
			'SELECT username AS username FROM `User` WHERE id = ?',
			[userId]
		);
		
		const [profileRows]: any = await pool.query(
			'SELECT * FROM `Profile` WHERE id_user = ?',
			[userId]
		);
		
		if (profileRows.length === 0) {
			res.status(404).json({ error: 'Profile not found' });
			return;
		}
		
		const [achievements]: any = await pool.query(
			`SELECT * FROM Achievements`
		);

		// recuperation des stats (nb_parties et surtout winrate)
		const [statsRows]: any = await pool.query(
			`SELECT 
				COUNT(id) AS nb_parties,
				ROUND(
					SUM(CASE WHEN id_winner = ? THEN 1 ELSE 0 END) * 100.0 / COUNT(id),
					0
				) AS winrate
			FROM Game
			WHERE id_player_one = ? OR id_player_second = ?`,
			[userId, userId, userId, userId]
		);

		const [friends]: any = await pool.query(
			'SELECT COUNT(*) AS nb_friends FROM friends WHERE id_user_1 = ?',
			[userId]
		);

		const [games]: any = await pool.query(
			`SELECT 
				g.*,
				u1.username AS username_player_one,
				u2.username AS username_player_second
			FROM Game g
			JOIN User u1 ON u1.id = g.id_player_one
			JOIN User u2 ON u2.id = g.id_player_second
			WHERE g.id_player_one = ?
			OR g.id_player_second = ?
			ORDER BY g.timestamp DESC
			LIMIT 10`,
			[userId, userId]
		);

		const [user_achievements]: any = await pool.query(
			'SELECT * FROM User_achievements WHERE id_user = ?',
			[userId]
		);

		var finalTab: any = [];
		var row;
		for (var i = 0; achievements[i]; ++i)
		{
			finalTab[i] = {};
			row = user_achievements.filter((a: any) => a.id_achievement === achievements[i].id);

			finalTab[i].progress = 0
			if (row && row[0])
				finalTab[i].progress = row[0].progression;
			finalTab[i].objective = achievements[i].objective;
			finalTab[i].name = achievements[i].name;
			finalTab[i]. description = achievements[i].description;

			// console.log(finalTab[i]);
		}

		res.status(200).json({
			...profileRows[0], // .. = spread operator pour envoyer chaque elem
			id: userId,
			nb_parties: statsRows[0].nb_parties ?? 0,
			winrate: statsRows[0].winrate ?? 0,
			// ...statsRows[0],
			nb_friends: friends[0].nb_friends,
			username: username[0].username,
			achievements: finalTab,
			games: games,
		});
	}
	catch (error: any)
	{
		console.log(error);
		res.status(500).json({message: error.message})
	}
});

// SELECT * FROM games
// WHERE id_player_one = 1
//    OR id_player_second = 1
// ORDER BY timestamp DESC
// LIMIT 10;

export default router;
