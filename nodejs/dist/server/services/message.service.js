import pool from '../db.js';
//enregitre les messages dans la database
export async function saveMessage(conversationId, senderId, content) {
    const [result] = await pool.execute(`INSERT INTO Message (id_conversation, id_sender, content, sent_at)
     VALUES (?, ?, ?, NOW())`, [conversationId, senderId, content]);
    return result.insertId;
}
