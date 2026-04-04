import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import multer from 'multer';
import path from 'path';
const router = Router();
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, '/app/src/server/public/avatars');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname.toLowerCase());
        const userId = req.params['id'];
        cb(null, `avatar_${userId}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 mo max
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error('Format non supporté'));
    }
});
router.post('/avatar/:id', upload.single('avatar'), async (req, res) => {
    const userId = parseInt(req.params['id']);
    if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    if (!req.file) {
        res.status(400).json({ error: 'Aucun fichier reçu' });
        return;
    }
    try {
        const filename = req.file.filename;
        await pool.query('UPDATE `Profile` SET path_img = ? WHERE id_user = ?', [`/avatars/${filename}`, userId]);
        const token = req.headers.authorization?.split(' ')[1];
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const new_token = jwt.sign({
            id: user.id,
            email: user.mail,
            username: user.username,
            language: user.language,
            path_img: `/avatars/${filename}`
        }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || "24h") });
        res.status(200).json({ path_img: `/avatars/${filename}`, token: new_token });
    }
    catch (err) {
        console.error('Erreur avatar: ', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
router.patch('/:id', async (req, res) => {
    const userId = parseInt(req.params['id']);
    if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    const { username, bio } = req.body;
    if (!username || username.trim() === '' || username.length > 30 || username.length < 3) {
        res.status(400).json({ error: 'Username invalide' });
        return;
    }
    if (bio && bio.length > 200) {
        res.status(400).json({ error: 'Bio trop longue' });
        return;
    }
    try {
        await pool.query('UPDATE `Profile` SET bio = ? WHERE id_user = ?', [bio?.trim() || null, userId]);
        await pool.query('UPDATE `User` SET username = ? WHERE id = ?', [username.trim(), userId]);
        const [user] = await pool.query('SELECT id, username, mail, language FROM `User` WHERE id = ?', [userId]);
        const [profile] = await pool.query('SELECT path_img FROM `Profile` WHERE id_user = ?', [userId]);
        const tokens = jwt.sign({
            id: user[0].id,
            email: user[0].mail,
            username: user[0].username,
            language: user[0].language,
            path_img: profile[0].path_img ?? null
        }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || "24h") });
        res.status(200).json({ message: 'Profil mis à jour', token: tokens });
    }
    catch (err) {
        console.log('Erreur SQL: ', err);
        res.status(500).json({ error: 'Erreur Serveur' });
    }
});
export default router;
