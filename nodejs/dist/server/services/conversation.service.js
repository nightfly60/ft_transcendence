import pool from '../db.js';
//cree conversation de type game chat dans la database
export async function createGameConversation(player1Id, player2Id, gameId) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.execute(`INSERT INTO Conversation (id_user_1, id_user_2, type, created_at) VALUES (?, ?, 'game', NOW())`, [player1Id, player2Id]);
        const conversationId = result.insertId;
        await conn.execute(`UPDATE Game SET id_conversation = ? WHERE id = ?`, [conversationId, gameId]);
        await conn.commit();
        return conversationId;
    }
    catch (e) {
        await conn.rollback();
        throw e;
    }
    finally {
        conn.release();
    }
}
//cree conversation de type DM dans la database
export async function createDMConversation(player1Id, player2Id) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.execute(`INSERT INTO Conversation (id_user_1, id_user_2, type, created_at) VALUES (?, ?, 'dm', NOW())`, [player1Id, player2Id]);
        const conversationId = result.insertId;
        await conn.commit();
        return conversationId;
    }
    catch (e) {
        await conn.rollback();
        throw e;
    }
    finally {
        conn.release();
    }
}
