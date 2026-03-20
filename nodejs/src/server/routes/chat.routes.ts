import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../db.js';
import { RowDataPacket } from "mysql2"; 

const router = Router();

//get user dm conversations from DB
router.get('/:id_user/conversations', async (req, res) => {
  const { id_user } = req.params;
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      ` SELECT c.id, c.id_user_1, c.created_at
      FROM Conversation c
      JOIN User u ON u.id = c.id_user_1
      WHERE c.id_user_1 = ?
      ORDER BY c.created_at ASC`,
      [id_user]
    );
    res.json(rows);
  } catch (error) {
    console.error('[GET conversations] error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});

//load message history for a conversation
router.get("/:id_conversation/Message", async (req, res) => {
  const { id_conversation } = req.params;
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.id, m.id_sender, m.content, m.sent_at
      FROM Message m
      JOIN User u ON u.id = m.id_sender
      WHERE m.id_conversation = ?
      ORDER BY m.sent_at ASC`,
      [id_conversation]
    );
    // console.log(`[GET messages] d_conversation: ${id_conversation}, rows fetched: ${rows.length}`);
    // console.log('[GET messages] data:', rows);
    res.json(rows);
  } catch (error) {
    console.error('[GET messages] error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 