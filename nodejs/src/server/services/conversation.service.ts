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

    // Create the conversation
    const [result] = await conn.execute<mysql.ResultSetHeader>(
      `INSERT INTO Conversation (id_user_1, id_user_2, type, created_at) VALUES (?, ?, 'game', NOW())`,
      [player1Id, player2Id]
    );
    const conversationId = result.insertId;

    //Link the conversation to the game
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

export async function createDMConversation(
  player1Id: number,
  player2Id: number,
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Create the conversation
    const [result] = await conn.execute<mysql.ResultSetHeader>(
      `INSERT INTO Conversation (id_user_1, id_user_2, type, created_at) VALUES (?, ?, 'dm', NOW())`,
      [player1Id, player2Id]
    );
    const conversationId = result.insertId;
    await conn.commit();
    return conversationId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}