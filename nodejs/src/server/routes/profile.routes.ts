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
    'SELECT * FROM `Profile` WHERE id = ?',
    [userId]
  );

  if (profileRows.length === 0) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  // recuperation des stats (nb_parties et surtout winrate)
  const [statsRows]: any = await pool.query(
	`SELECT 
		COUNT(ug.id) AS nb_parties,
		ROUND(
			SUM(CASE WHEN g.id_winner = ? THEN 1 ELSE 0 END) * 100.0 / COUNT(ug.id),
			0
		) AS winrate
	FROM User_Game ug
	JOIN Game g ON g.id = ug.id
	WHERE ug.id_player_one = ? OR ug.id_player_second = ?`,
	[userId, userId, userId, userId]
);

  const [friends]: any = await pool.query(
	'SELECT COUNT(*) AS nb_friends FROM friends WHERE id_user_1 = ? OR id_user_2 = ?',
	[userId, userId]
);

  res.status(200).json({
	...profileRows[0], // .. = spread operator pour envoyer chaque elem
	nb_parties: statsRows[0].nb_parties ?? 0,
	winrate: statsRows[0].winrate ?? 0,
	// ...statsRows[0],
	nb_friends: friends[0].nb_friends,
	username: username[0].username,
  });
});

export default router;
