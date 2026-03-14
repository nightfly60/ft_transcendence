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

const requestMax = 50;

export const checkAPI = async (req: any, res: Response, next: NextFunction) => {
	const key = req.headers['x-api-key'];
	// requestTime in seconds
	const requestRate = 60 * 5;

	if (!key) {
		res.status(401).json({ error: 'Non autorisé' });
		return;
	}

	try {
		const [rows]: any = await pool.query(
			`SELECT * FROM User_API WHERE secret_key = ?`,
			[key]
		);

		if (rows.length === 0) {
			return res.status(401).json({ error: 'Clé Invalide' });
		}

		var usages = rows[0].usages;
		var reset_time = new Date(rows[0].reset_date);

		if (reset_time.getTime() < Date.now())
		{
			var datetime = new Date(Date.now() + requestRate * 1000);
			reset_time = datetime;

			await pool.query(
				"UPDATE User_API SET reset_date = ?, usages = 0 WHERE secret_key = ?",
				[datetime, key]
			);
			usages = 0;
		}

		res.header('X-API-Usages', usages + 1);
		res.header('X-API-Reset-Time', (reset_time.getTime()).toString());

		if (usages + 1 >= requestMax)
			return res.status(401).json({ error: 'Rate Limite Atteinte (ERROR)' });

		await pool.query(
			`UPDATE User_API SET usages = usages + 1 WHERE secret_key = ?`,
			[key]
		);

		next();
	} catch (err: any) {
		console.log(err)
		res.status(401).json({ error: 'Clé Invalide (ERROR)' });
	}
};

