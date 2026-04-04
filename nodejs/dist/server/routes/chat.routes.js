import { Router } from 'express';
import pool from '../db.js';
const router = Router();
//recupere historique des messages d'une conversation
router.get("/:id_conversation/Message", async (req, res) => {
    const { id_conversation } = req.params;
    try {
        const [rows] = await pool.execute(`SELECT m.id, m.id_sender, m.content, m.sent_at
      FROM Message m
      JOIN User u ON u.id = m.id_sender
      WHERE m.id_conversation = ?
      ORDER BY m.sent_at ASC`, [id_conversation]);
        res.json(rows);
    }
    catch (error) {
        console.error('[GET messages] error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//recupere les conversations DM d'un utilisateur
router.get('/user/:id_user/conversations', async (req, res) => {
    const { id_user } = req.params;
    try {
        const [rows] = await pool.execute(`SELECT c.id, c.created_at,
      CASE WHEN c.id_user_1 = ? THEN c.id_user_2 ELSE c.id_user_1 END as otherUserId,
      CASE WHEN c.id_user_1 = ? THEN u2.username ELSE u1.username END as username,
      CASE WHEN c.id_user_1 = ? THEN p2.path_img ELSE p1.path_img END as path_img
      FROM Conversation c
      JOIN User u1 ON u1.id = c.id_user_1
      JOIN User u2 ON u2.id = c.id_user_2
      JOIN Profile p1 ON p1.id_user = c.id_user_1
      JOIN Profile p2 ON p2.id_user = c.id_user_2
      WHERE (c.id_user_1 = ? OR c.id_user_2 = ?)
      AND c.type = 'dm'`, [id_user, id_user, id_user, id_user, id_user]);
        res.json(rows);
    }
    catch (error) {
        console.error('[GET conversations] error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
