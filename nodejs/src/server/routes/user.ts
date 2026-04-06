import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/online', async (req: Request, res: Response) => {
  try {
    const selfId = (req as any).user?.id ?? null;
    const [rows]: any = await pool.query(
      `SELECT u.id, u.username, p.path_img
       FROM User u
       LEFT JOIN Profile p ON p.id_user = u.id
       WHERE u.last_seen IS NOT NULL
         AND TIMESTAMPDIFF(SECOND, u.last_seen, NOW()) < 60
         AND u.id != ?`,
      [selfId ?? 0]
    );
    res.json({ users: rows });
  } catch (err: any) {
    console.error('[GET /users/online] erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, mail, two_fa, language, username FROM `User` WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    console.error('[GET /users/:id] erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});







export default router;
