import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
const router = Router();
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT 
				u.id,
				u.username,
				u.mail,
				u.two_fa,
				u.language,
				u.last_seen,
				p.xp,
				p.elo,
				p.bio
			FROM User u
			JOIN Profile p ON p.id_user = u.id`);
        return res.status(200).json(rows);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
router.get('/users/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT 
				u.id,
				u.username,
				u.mail,
				u.two_fa,
				u.language,
				u.last_seen,
				p.xp,
				p.elo,
				p.bio
			FROM User u
			JOIN Profile p ON p.id_user = u.id
			WHERE u.id = ?`, [req.params['id']]);
        return res.status(200).json(rows);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
router.post('/users', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email)
        return res.status(400).json({ error: 'All the informations must be given (username, password, email)' });
    try {
        const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
        const [user_result] = await pool.query('INSERT INTO `User` (mail, password, username, language) VALUES (?, ?, ?, ?)', [email, hash, username, 'fr']);
        await pool.query('INSERT INTO `Profile` (id_user, elo, xp) VALUES (?, ?, ?)', [user_result.insertId, Number(process.env.BASE_ELO) || 400, 0]);
        return res.status(200).json({ message: 'Utilisateur cree' });
    }
    catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email déjà utilisé' });
            return;
        }
        console.log(err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
router.delete('/users/:id', async (req, res) => {
    try {
        const [user] = await pool.query('SELECT * FROM User WHERE id = ?', [req.params['id']]);
        if (user.length === 0)
            return res.status(404).json({ error: 'Utilisateur Non Trouve' });
        await pool.query(`DELETE FROM User WHERE id = ?`, [req.params['id']]);
        await pool.query(`DELETE FROM Profile WHERE id_user = ?`, [req.params['id']]);
        return res.status(200).json({ message: 'Utilisateur Supprime' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
router.put('/users/:id', async (req, res) => {
    const { username, bio, language } = req.body;
    try {
        const [user] = await pool.query('SELECT * FROM User WHERE id = ?', [req.params['id']]);
        if (user.length === 0)
            return res.status(404).json({ error: 'Utilisateur Non Trouve' });
        if (username) {
            await pool.query('UPDATE `User` SET username = ? WHERE id = ?', [username, req.params['id']]);
        }
        if (bio) {
            await pool.query('UPDATE `Profile` SET bio = ? WHERE id_user = ?', [bio, req.params['id']]);
        }
        if (language) {
            await pool.query('UPDATE `User` SET language = ? WHERE id = ?', [language, req.params['id']]);
        }
        return res.status(200).json({ message: 'Utilisateur mis a jour' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});
export default router;
