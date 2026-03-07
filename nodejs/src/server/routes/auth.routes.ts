import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();


function validateEmail(mail: string): boolean {
	var re = /\S+@\S+\.\S+/;
	return re.test(mail);
}

router.post('/register', async (req, res) => {
	const { username, password, email } = req.body;

	if (!validateEmail(email)) {
		res.status(400).json({ error: 'Adresse Email incorrecte' });
		return ;
	}
	if (password.length < 3)
	{
		res.status(400).json( {error: 'Mot de passe trop court' });
		return ;
	}
	if (username.length < 3)
	{
		res.status(400).json( {error: 'Username trop court' });
		return ;
	}

	try
	{
		const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

		const [user_result]: any = await pool.query(
			'INSERT INTO `User` (mail, password, username, language) VALUES (?, ?, ?, ?)',
			[email, hash, username, 'fr']
		);

		const [profile_result]: any = await pool.query(
			'INSERT INTO `Profile` (id_user, elo, xp) VALUES (?, ?, ?)',
			[user_result.insertId, Number(process.env.BASE_ELO) || 400, 0]
		);

		res.status(201).json({ message: 'Nouvel utilisateur enregistré' });

	} catch (err: any)
	{
		if (err.code === 'ER_DUP_ENTRY')
		{
			res.status(400).json( {error: 'Email ou Username déjà utilisé' });
			return ;
		}

		await pool.query(
			'DELETE FROM `User` WHERE mail=?',
			[email]
		);

		console.error(err);
		res.status(500).json({ error: 'Erreur Serveur' });
	}
});

router.post('/login', async (req, res) => {
	const { password, email } = req.body;

	console.log("==== DATAS RECUS =====");
	console.log("mail: ", email);
	console.log("password: ", password);

	if (!validateEmail(email)) {
		res.status(400).json({ error: 'Adresse Email incorrecte' });
		return ;
	}
	if (password.length < 3) {
		res.status(400).json({ error: 'Mot de passe invalide' });
		return ;
	}

	try
	{
		const [result]: any = await pool.query(
			'SELECT id, mail, password, username, language, two_fa FROM `User` WHERE mail = ?',
			[email]
		);
		if (result.length === 0)
		{
			res.status(404).json({ error: 'Utilisateur non trouvé' });
			return ;
		}

		const user = result[0];
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (isPasswordValid)
		{
			const token = jwt.sign(
				{
					id: user.id,
					email: user.mail,
					username: user.username,
					language: user.language
				},
				process.env.JWT_SECRET || "02a70f0b6ea2556ea2afa6309aafa9ab8d87b7f049eef3d51e808c27057c4421",
				{ expiresIn: (process.env.JWT_EXPIRES_IN || "24h")}
			);
			res.status(200).json({ message: 'Connecté', token: token});
			return ;
		}
		else
		{
			res.status(400).json({ error: 'Mot de passe Incorrect' });
			return ;
		}

	} catch (err: any)
	{
		console.error(err);
		res.status(500).json({ error: 'Erreur Serveur' });
	}
});

export default router;
