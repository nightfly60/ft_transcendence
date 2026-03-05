import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();


router.get('/:id', async (req: Request, res: Response) => {
  const [rows]: any = await pool.query(
    'SELECT id, mail, two_fa, language, username FROM `User` WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(rows[0]);
});







export default router;
