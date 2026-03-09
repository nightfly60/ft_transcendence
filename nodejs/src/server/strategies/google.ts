import { VerifyCallback } from "jsonwebtoken";
import passport from "passport";
import {Profile, Strategy} from 'passport-google-oauth20';
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

passport.use(new Strategy({
	clientID: process.env.GOOGLE_CLIENT_ID!,
	clientSecret: process.env.GOOGLE_SECRET_ID!,
	callbackURL: process.env.GOOGLE_AUTH_REDIRECT!,
	scope: ['email', 'profile'],
}, async (accessToken: string, refreshToken: string, profile: Profile,done: VerifyCallback ) => {
	const email = profile._json.email;
	const username = profile._json.name;
	const image_url = profile._json.picture || null;

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

				var file = null
				if (image_url)
					file = await downloadImage(image_url, user_result.insertId);

				const [profile_result]: any = await pool.query(
					'INSERT INTO `Profile` (id_user, elo, xp, path_img) VALUES (?, ?, ?, ?)',
					[user_result.insertId, Number(process.env.BASE_ELO) || 400, 0, file]
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
