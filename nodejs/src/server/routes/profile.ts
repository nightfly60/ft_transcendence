import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/:username', async (req: Request, res: Response) => {
  const [rows]: any = await pool.query(
    'SELECT id FROM `User` WHERE username = ?',
    [req.params.username]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const [profileRows]: any = await pool.query(
	'SELECT * FROM `Profile` WHERE id = ?',
	[rows[0].id]
  );
  if (profileRows.length === 0) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.status(200).json(profileRows[0]);
//  console.log(rows[0].id);
//  console.log(profileRows[0]);
});

export default router;
