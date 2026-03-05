import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();


router.get('/', async (_req: Request, res: Response) => {
  const [rows] = await pool.query(
    'SELECT id, mail, two_fa, language, username FROM `User`'
  );
  res.json(rows);
});


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


router.post('/', async (req: Request, res: Response) => {
  const { mail, password, username, language, two_fa } = req.body;
  if (!mail || !password) {
    res.status(400).json({ error: 'mail and password are required' });
    return;
  }
  const [result]: any = await pool.query(
    'INSERT INTO `User` (mail, password, username, language, two_fa) VALUES (?, ?, ?, ?, ?)',
    [mail, password, username ?? null, language ?? null, two_fa ?? false]
  );
  res.status(201).json({ id: result.insertId, mail, username });
});


router.put('/:id', async (req: Request, res: Response) => {
  const { mail, username, language, two_fa } = req.body;
  const [result]: any = await pool.query(
    'UPDATE `User` SET mail = COALESCE(?, mail), username = COALESCE(?, username), language = COALESCE(?, language), two_fa = COALESCE(?, two_fa) WHERE id = ?',
    [mail ?? null, username ?? null, language ?? null, two_fa ?? null, req.params.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ message: 'User updated' });
});


router.delete('/:id', async (req: Request, res: Response) => {
  const [result]: any = await pool.query(
    'DELETE FROM `User` WHERE id = ?',
    [req.params.id]
  );
  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ message: 'User deleted' });
});

export default router;
