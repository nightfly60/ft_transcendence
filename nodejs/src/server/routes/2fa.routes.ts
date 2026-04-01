import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as QRCode from 'qrcode';
import { generateSecret, generateURI, verify } from "otplib";

const router = Router();

router.post('/enable', async (req, res) => {
	try {
		const user = req.user;

		if (!user)
		{
			res.status(404).json({message: 'User not found'});
			return ;
		}
		const [result]: any = await pool.query(
			'SELECT id, mail, password, username, language, two_fa, two_fa_secret FROM `User` WHERE id = ?',
			[user.id]
		);
		if (result.length === 0)
		{
			res.status(404).json({ error: 'Utilisateur non trouvé' });
			return ;
		}
		if (result[0].two_fa)
			return res.status(400).json({error: 'Double Authentification Deja Active'});

		const secret = generateSecret();

		const uri = generateURI({
			issuer: 'Chess42',
			label: result[0].mail,
			secret
		})
		const qrDataUrl = await QRCode.toDataURL(uri);

		res.status(200).json({secret, qrDataUrl, uri})
	}
	catch (error: any)
	{
		// console.log(error);
		res.status(500).json({message: error.message})
	}
})

router.post('/confirm', async (req, res) => {
	const {token, secret} = req.body;

	try
	{
		const isValid = await verify({
			secret,
			token,
			strategy: 'totp'
		});
	
		if (!isValid.valid) return res.status(400).json({ message: 'Token invalide' });
	
		const [user_request]: any = await pool.query(
			'UPDATE `User` SET two_fa = ?, two_fa_secret = ? WHERE id = ?',
			[true, secret, req.user.id]
		);

		res.status(200).json({ message: '2FA activé' });
	}
	catch (error: any)
	{
		// console.log(error);
		res.status(500).json({message: error.message})
	}

})

export default router;
