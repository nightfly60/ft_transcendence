import { Router } from 'express';
import pool from '../db.js';
import crypto from 'crypto';
const router = Router();
router.get('/getKey', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Utilisateur Invalide' });
    const user = req.user;
    try {
        const [userAPI] = await pool.query(`SELECT * FROM User_API WHERE id_user = ?`, [user.id]);
        if (userAPI.length === 0)
            return res.status(200).json('');
        // console.log(userAPI);
        return res.status(200).json(userAPI[0].secret_key);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Erreur Serveur' });
    }
});
router.post('/genKey', async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Utilisateur Invalide' });
    const user = req.user;
    // requestTime in seconds
    const requestRate = 60 * 5;
    try {
        const [userAPI] = await pool.query(`SELECT * FROM User_API WHERE id_user = ?`, [user.id]);
        if (userAPI.length > 0)
            return res.status(400).json({ error: 'Vous avez déjà une clé' });
        const key = crypto.randomBytes(32).toString("hex");
        var datetime = new Date(Date.now() + requestRate * 1000);
        await pool.query("INSERT INTO User_API (id_user, usages, reset_date, secret_key) VALUES (?, 0, ?, ?)", [user.id, datetime, key]);
        return res.status(200).json(key);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Erreur Serveur' });
    }
});
export default router;
