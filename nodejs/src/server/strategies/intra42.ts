import passport, { Profile } from 'passport';
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';
import pool from '../db.js';
import axios from "axios";
import { writeFile } from "fs/promises";
import path from "path";

async function downloadImage(url: string, userId: string): Promise<string> {
	const response = await axios.get(url, { 
		responseType: "arraybuffer"
	});
	if (response.data.byteLength === 0) {
		throw new Error("Empty response — URL invalide ou accès refusé");
	}
	const contentType = response.headers["content-type"] || "";
	const ext = contentType.includes("png")  ? ".png"
			: contentType.includes("jpeg") ? ".jpg"
			: contentType.includes("webp") ? ".webp"
			: contentType.includes("gif")  ? ".gif"
			: path.extname(new URL(url).pathname) || ".jpg";

	await writeFile(`/app/src/server/public/avatars/avatar_${userId}${ext}`, Buffer.from(response.data));

	return `/avatars/avatar_${userId}${ext}`;
}

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
			const image_url = data.image.versions.small || null;

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

					var file = null
					if (image_url)
						file = await downloadImage(image_url, user_result.insertId);

					const [profile_result]: any = await pool.query(
						'INSERT INTO `Profile` (id_user, elo, xp, path_img) VALUES (?, ?, ?, ?)',
						[user_result.insertId, 400, 0, file]
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
