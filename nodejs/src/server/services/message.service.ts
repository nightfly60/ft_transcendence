import pool from '../db.js';
import mysql from 'mysql2/promise';

//enregitre les messages dans la database
export async function saveMessage(
  conversationId: number,
  senderId: number,
  content: string
) {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO Message (id_conversation, id_sender, content, sent_at)
     VALUES (?, ?, ?, NOW())`,
    [conversationId, senderId, content]
  );
  return result.insertId;
}