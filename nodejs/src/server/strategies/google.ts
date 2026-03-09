import { VerifyCallback } from "jsonwebtoken";
import passport from "passport";
import {Profile, Strategy} from 'passport-google-oauth20';
import pool from '../db.js';

passport.use(new Strategy({
	clientID: process.env.GOOGLE_CLIENT_ID!,
	clientSecret: process.env.GOOGLE_SECRET_ID!,
	callbackURL: process.env.GOOGLE_AUTH_REDIRECT!,
	scope: ['email', 'profile'],
}, async (accessToken: string, refreshToken: string, profile: Profile,done: VerifyCallback ) => {
	const email = profile._json.email;
	const username = profile._json.name;
	var user = {
		email: email,
		username: username,
		language: null,
		id: null,
		profile_image: null
	};
	// chercher le user
	try
	{
		const [result]: any = await pool.query(
			'SELECT id, mail, password, username, language, two_fa FROM `User` WHERE mail = ?',
			[email]
		);

		// le user existe pas
		if (result.length === 0)
		{
			try
			{
				const [user_result]: any = await pool.query(
					'INSERT INTO `User` (mail, password, username, language) VALUES (?, ?, ?, ?)',
					[email, '', profile._json.name, 'fr']
				);

				const [profile_result]: any = await pool.query(
					'INSERT INTO `Profile` (id_user, elo, xp) VALUES (?, ?, ?)',
					[user_result.insertId, Number(process.env.BASE_ELO) || 400, 0]
				);
			} catch (err: any)
			{
				await pool.query(
					'DELETE FROM `User` WHERE mail=?',
					[email]
				);

				console.error(err);
			}
		}
	} catch (err) {}

	// le user existe
	try
	{
		const [finalUserRes]: any = await pool.query(
			'SELECT id, mail, password, username, language, two_fa FROM `User` WHERE mail = ?',
			[email]
		);
		const finalUser = finalUserRes[0];

		const [profile]: any = await pool.query(
			'SELECT path_img FROM `Profile` WHERE id_user = ?',
			[finalUser.id]
		);
	
		user.id = finalUser.id;
		user.language = finalUser.language;
		user.username = finalUser.username;
		user.profile_image = profile[0].path_img
	}
	catch (err) {}

	done(null, user);
	return ;
}))
