import { VerifyCallback } from 'jsonwebtoken';
import passport from 'passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import pool from '../db.js';
import axios from 'axios';
import { writeFile } from 'fs/promises';
import path from 'path';

async function downloadImage(url: string, userId: string): Promise<string> {
  const response = await axios.get(url, {
	responseType: 'arraybuffer',
  });

  if (response.data.byteLength === 0) {
	throw new Error('Empty response — URL invalide ou accès refusé');
  }

  const contentType = response.headers['content-type'] || '';
  const ext = contentType.includes('png')
	? '.png'
	: contentType.includes('jpeg')
	? '.jpg'
	: contentType.includes('webp')
	? '.webp'
	: contentType.includes('gif')
	? '.gif'
	: path.extname(new URL(url).pathname) || '.jpg';

  await writeFile(`/app/src/server/public/avatars/avatar_${userId}${ext}`, Buffer.from(response.data));
  return `/avatars/avatar_${userId}${ext}`;
}

const googleCallBack = async (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback,
) => {
  const email = profile._json.email;
  const username = profile._json.name;
  const image_url = profile._json.picture || null;

  const user = {
	email,
	username,
	language: null,
	id: null,
	profile_image: null,
  } as {
	email: string;
	username: string;
	language: string | null;
	id: number | null;
	profile_image: string | null;
  };

  try {
	const [result]: any = await pool.query(
	  'SELECT id, mail, password, username, language, two_fa FROM `User` WHERE mail = ?',
	  [email],
	);

	if (result.length === 0) {
	  try {
		const [user_result]: any = await pool.query(
		  'INSERT INTO `User` (mail, password, username, language) VALUES (?, ?, ?, ?)',
		  [email, '', username, 'fr'],
		);

		let file: string | null = null;
		if (image_url) {
		  file = await downloadImage(image_url, String(user_result.insertId));
		}

		await pool.query(
		  'INSERT INTO `Profile` (id_user, elo, xp, path_img) VALUES (?, ?, ?, ?)',
		  [user_result.insertId, 400, 0, file],
		);
	  } catch (err: any) {
		console.error('Google callback create user failed:', err);
		await pool
		  .query('DELETE FROM `User` WHERE mail=?', [email])
		  .catch((cleanupErr) => {
			console.error('Cleanup failed after Google user creation error:', cleanupErr);
		  });
		done(err as any);
		return;
	  }
	}
  } catch (err: any) {
	console.error('Google callback user lookup failed:', err);
	done(err as any);
	return;
  }

  try {
	const [finalUserRes]: any = await pool.query(
	  'SELECT id, mail, password, username, language, two_fa FROM `User` WHERE mail = ?',
	  [email],
	);

	if (!finalUserRes.length) {
	  const err = new Error('Utilisateur introuvable après création');
	  console.error(err);
	  done(err as any);
	  return;
	}

	const finalUser = finalUserRes[0];
	const [profileRows]: any = await pool.query(
	  'SELECT path_img FROM `Profile` WHERE id_user = ?',
	  [finalUser.id],
	);

	if (!profileRows.length) {
	  const err = new Error('Profil introuvable pour l’utilisateur');
	  console.error(err);
	  done(err as any);
	  return;
	}

	user.id = finalUser.id;
	user.language = finalUser.language;
	user.username = finalUser.username;
	user.profile_image = profileRows[0].path_img;
  } catch (err: any) {
	console.error('Google callback final select failed:', err);
	done(err as any);
	return;
  }

  done(null, user);
};

passport.use(
  new Strategy(
	{
	  clientID: process.env.GOOGLE_CLIENT_ID!,
	  clientSecret: process.env.GOOGLE_SECRET_ID!,
	  callbackURL: process.env.GOOGLE_AUTH_REDIRECT!,
	  scope: ['email', 'profile'],
	} as any,
	googleCallBack as any,
  ),
);
