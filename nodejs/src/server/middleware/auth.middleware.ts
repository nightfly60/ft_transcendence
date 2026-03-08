import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: any, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(401).json({ error: 'Non autorisé' });
		return;
	}

	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET || "...");
		next();
	} catch (err: any) {
		if (err.name === 'TokenExpiredError') {
			res.status(401).json({ error: 'Token expiré' });
		} else {
			res.status(401).json({ error: 'Token invalide' });
		}
	}
};
