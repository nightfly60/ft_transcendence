import { Router } from 'express';
import pool from '../db.js';
const router = Router();
router.get('/online', async (req, res) => {
    const selfId = req.user?.id ?? null;
    const [rows] = await pool.query(`SELECT u.id, u.username, p.path_img
     FROM User u
     LEFT JOIN Profile p ON p.id_user = u.id
     WHERE u.last_seen IS NOT NULL
       AND TIMESTAMPDIFF(SECOND, u.last_seen, NOW()) < 60
       AND u.id != ?`, [selfId ?? 0]);
    res.json({ users: rows });
});
router.get('/:id', async (req, res) => {
    const [rows] = await pool.query('SELECT id, mail, two_fa, language, username FROM `User` WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    res.json(rows[0]);
});
export default router;
