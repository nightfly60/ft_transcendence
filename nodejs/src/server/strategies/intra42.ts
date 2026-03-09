import passport, { Profile } from 'passport';
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';
import pool from '../db.js';

passport.use('intra42', new OAuth2Strategy(
	{
		authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
		tokenURL: 'https://api.intra.42.fr/oauth/token',
		clientID: process.env.FT_CLIENT_ID,
		clientSecret: process.env.FT_SECRET_ID,
		callbackURL: process.env.FT_AUTH_REDIRECT,
		scope: ['public'],
	},
	async (accessToken: string, refreshToken: string, profile: Profile,done: VerifyCallback) => {
		try
		{
			const res = await fetch('https://api.intra.42.fr/v2/me', {
				headers: { Authorization: `Bearer ${accessToken}` },
			})

			const data = await res.json();

			var user = {
				mail: data.email,
				username: data.login,
				language: null,
				id: null,
				profile_image: null
			}

			// chercher le user
			const [result]: any = await pool.query(
				'SELECT id, mail, password, username, language, two_fa FROM `User` WHERE mail = ?',
				[data.email]
			);
			// le user existe pas
			if (result.length === 0)
			{
				try
				{
					const [user_result]: any = await pool.query(
						'INSERT INTO `User` (mail, password, username, language) VALUES (?, ?, ?, ?)',
						[data.email, '', data.login, 'fr']
					);

					const [profile_result]: any = await pool.query(
						'INSERT INTO `Profile` (id_user, elo, xp) VALUES (?, ?, ?)',
						[user_result.insertId, Number(process.env.BASE_ELO) || 400, 0]
					);
				} catch (err: any)
				{
					await pool.query(
						'DELETE FROM `User` WHERE mail=?',
						[data.email]
					);

					console.error(err);
					done(null, user);
					return ;
				}
			}

			// le user existe
			const [finalUserRes]: any = await pool.query(
				'SELECT id, mail, password, username, language, two_fa FROM `User` WHERE mail = ?',
				[data.email]
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

			done(null, user);
			return ;
		}
		catch (err)
		{
			console.log(err);
			done(err);
			return ;
		}
	}
))
