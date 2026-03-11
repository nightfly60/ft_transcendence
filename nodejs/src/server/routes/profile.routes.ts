import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

// recuperation de l'id
router.get('/:id', async (req: Request, res: Response) => {
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

  const [achievements]: any = await pool.query(
    `SELECT a.name, a.description, ua.type
     FROM User_achievements ua
     JOIN Achievements a ON a.id = ua.id_achievement
     WHERE ua.id_user = ?
	 AND ua.type = 100`,
    [userId]
  );

  res.status(200).json({
	...profileRows[0], // .. = spread operator pour envoyer chaque elem
	nb_parties: statsRows[0].nb_parties ?? 0,
	winrate: statsRows[0].winrate ?? 0,
	// ...statsRows[0],
	nb_friends: friends[0].nb_friends,
	username: username[0].username,
	achievements: achievements,
  });
});

export default router;
