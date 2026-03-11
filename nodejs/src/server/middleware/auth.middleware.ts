import { Request, Response, NextFunction } from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

export const requireAuth = async (req: any, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(401).json({ error: 'Non autorisé' });
		return;
	}

	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET || "...");
		
		const [rows]: any = await pool.query(
			`SELECT * FROM User WHERE id = ?`,
			[(req.user as any).id]
		);

		if (rows.length === 0) {
			return res.status(401).json({ error: 'Utilisateur Invalide' });
		}

		await pool.query(
			`UPDATE User SET last_seen = NOW() WHERE id = ?`,
			[(req.user as any).id]
		);

		next();
	} catch (err: any) {
		if (err.name === 'TokenExpiredError') {
			res.status(401).json({ error: 'Token expiré' });
		} else {
			res.status(401).json({ error: 'Token invalide' });
		}
	}
};
