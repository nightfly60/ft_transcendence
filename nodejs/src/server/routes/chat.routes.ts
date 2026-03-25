import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../db.js';
import { RowDataPacket } from "mysql2";
import { createDMConversation } from '../services/conversation.service.js';

const router = Router();

//get user dm conversations from DB
router.get('/user/:id_user/conversations', async (req, res) => {
  const { id_user } = req.params;
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.id, c.created_at,
      CASE WHEN c.id_user_1 = ? THEN c.id_user_2 ELSE c.id_user_1 END as otherUserId,
      CASE WHEN c.id_user_1 = ? THEN u2.username ELSE u1.username END as username,
      CASE WHEN c.id_user_1 = ? THEN p2.path_img ELSE p1.path_img END as path_img
      FROM Conversation c
      JOIN User u1 ON u1.id = c.id_user_1
      JOIN User u2 ON u2.id = c.id_user_2
      JOIN Profile p1 ON p1.id_user = c.id_user_1
      JOIN Profile p2 ON p2.id_user = c.id_user_2
      WHERE (c.id_user_1 = ? OR c.id_user_2 = ?)
      AND c.type = 'dm'`,
      [id_user, id_user, id_user, id_user, id_user]
    );
    // console.log(`[GET conversations] id_user: ${id_user}, rows fetched: ${rows.length}`);
    // console.log('[GET conversations] data:', rows);
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

router.post('/dm', async (req, res) => { //useless ?
  const { userId1, userId2 } = req.body;
  try {
    const conversationId = await createDMConversation(userId1, userId2);
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.username, p.path_img 
      FROM User u
      JOIN Profile p ON p.id_user = u.id
      WHERE u.id = ?`,
      [userId2]
    );
    res.json({
      conv_id: conversationId,
      otherUserId: userId2,
      username: rows[0].username,
      path_img: rows[0].path_img,
      creation: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 