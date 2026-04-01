import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/index', async (req, res) => {
	try
	{
		const [list]: any = await pool.query(
			`SELECT 
				u.id,
				u.username,
				p.xp,
				p.elo
			FROM User u
			JOIN Profile p ON p.id_user = u.id
			ORDER BY p.elo DESC`,
		);

		// console.log(list);
		res.status(200).json(list);
	}
	catch (err: any)
	{
		console.log(err);
		return res.status(500).json({ error: 'Erreur Serveur' });
	}

});

export default router;
