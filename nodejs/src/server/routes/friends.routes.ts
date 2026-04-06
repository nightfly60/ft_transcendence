import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router()

router.get('/status/:targetId', requireAuth, async (req, res) => {
	if (!req.user)
		return res.status(500).json({error: 'Non autorise'});
	const userId = (req.user as any).id;
	const targetId = parseInt(req.params['targetId'] as string);

	if (userId === targetId)
		return res.json({ isFriend: false });

	try
	{
		const [rows]: any = await pool.query(
			`SELECT * FROM friends WHERE (id_user_1 = ? AND id_user_2 = ?)`,
			[userId, targetId]
		);
		res.json({ isFriend: rows.length > 0 });
	}
	catch (err)
	{
		res.status(500).json({error: 'Erreur serveur'});
	}
});

router.post('/add/:targetId', requireAuth, async (req, res) => {
	if (!req.user)
		return res.status(500).json({error: 'Non autorise'});
	const userId = (req.user as any).id;
	const targetId = parseInt(req.params['targetId'] as string);

	if (userId === targetId)
		return res.status(400).json({error: 'Impossible de s\'ajouter soit-meme'});

	try
	{
		const [existing]: any = await pool.query(
			`SELECT * FROM friends WHERE (id_user_1 = ? AND id_user_2 = ?)`,
			[userId, targetId]
		);

		if (existing.length > 0)
			return res.status(400).json({error: 'Deja amis'});

		await pool.query(
			`INSERT INTO friends (id_user_1, id_user_2) VALUES (?, ?)`,
			[userId, targetId]
		);
		res.status(201).json({message: 'Ami ajouté'})
	}
	catch (err)
	{
		res.status(500).json({error: 'Erreur serveur'});
	}
});

router.delete('/remove/:targetId', requireAuth, async (req, res) => {
	if (!req.user)
		return res.status(500).json({error: 'Non autorise'});
	const userId = (req.user as any).id;
	const targetId = parseInt(req.params['targetId'] as string);

	try
	{
		await pool.query(
			`DELETE FROM friends WHERE (id_user_1 = ? AND id_user_2 = ?)`,
			[userId, targetId]
		);
		res.json({message: 'Ami supprimé'});
	}
	catch (err)
	{
		res.status(500).json({error: 'Erreur serveur'});
	}
});

router.get('/online/:targetId', requireAuth, async (req, res) => {
	const targetId = parseInt(req.params['targetId'] as string);

	try
	{
		const [rows]: any = await pool.query(
			`SELECT last_seen FROM User WHERE id = ?`,
			[targetId]
		);
		if (!rows.length)
			return res.status(404).json({error: 'Utilisateur non trouve'});

		const last_seen = new Date(rows[0].last_seen);
		if (last_seen)
		{
			const diffSeconds = (Date.now() - last_seen.getTime()) / 1000;
			const isOnline = diffSeconds < 60; // en ligne si actif les X dernieres secondes
			res.json({isOnline: isOnline, last_seen: rows[0].last_seen})
			return ;
		}
		res.json({isOnline: false, last_seen: rows[0].last_seen})
	}
	catch (err)
	{
		res.status(500).json({error: 'Erreur serveur'});
	}
});

router.get('/list/:id', requireAuth, async (req, res) => {
  const userId = parseInt(req.params['id'] as string);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
 
  try {
	const [friends]: any = await pool.query(
		`SELECT 
			u.id,
			u.username,
			p.path_img,
			p.elo,
			u.last_seen
		FROM friends f
		JOIN User u ON u.id = f.id_user_2
		JOIN Profile p ON p.id_user = u.id
		WHERE f.id_user_1 = ?`,
		[userId]
	);
	
		res.status(200).json(friends);
	}
	catch (err)
	{
		console.error('Erreur liste amis:', err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

export default router;
