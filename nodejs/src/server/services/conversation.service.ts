import pool from '../db.js';
import mysql from 'mysql2/promise';

export async function createGameConversation(
  player1Id: number,
  player2Id: number,
  gameId: number
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Create the conversation
    const [result] = await conn.execute<mysql.ResultSetHeader>(
      `INSERT INTO Conversations (type, created_at) VALUES ('game', NOW())`
    );
    const conversationId = result.insertId;

    // 2. Add both players as participants
    await conn.execute(
      `INSERT INTO Conversation_Participants (id_conversation, id_participant) VALUES (?, ?), (?, ?)`,
      [conversationId, player1Id, conversationId, player2Id]
    );

    // 3. Link the conversation to the game
    await conn.execute(
      `UPDATE Game SET id_conversation = ? WHERE id = ?`,
      [conversationId, gameId]
    );

    await conn.commit();
    return conversationId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}