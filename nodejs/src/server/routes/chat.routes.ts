import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../db.js';
import { RowDataPacket } from "mysql2"; 

const router = Router();

router.get("/conversations/:conversationId/messages", async (req, res) => {
  const { conversationId } = req.params;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT m.id, m.id_sender, m.content, m.sent_at
     FROM Messages m
     JOIN Userss u ON u.id = m.id_sender
     WHERE m.id_conversation = ?
     ORDER BY m.sent_at ASC`,
    [conversationId]
  );
  console.log(`[GET messages] conversationId: ${conversationId}, rows fetched: ${rows.length}`);
  console.log('[GET messages] data:', rows);
  res.json(rows);
});