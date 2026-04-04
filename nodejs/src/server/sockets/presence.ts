import { Server, Socket } from 'socket.io';
import { RowDataPacket } from 'mysql2';
import pool from '../db.js';

export interface UserPresence {
  id: number;
  username: string;
  path_img: string | null;
}

interface PresenceEntry extends UserPresence {
  socketCount: number;
}

const presenceMap = new Map<number, PresenceEntry>();

/**
 * Ajoute une socket pour un userId.
 * Retourne true si l'utilisateur vient de passer en ligne.
 */
export function addSocket(userId: number, info: UserPresence): boolean {
  const existing = presenceMap.get(userId);
  if (existing) {
    existing.socketCount++;
    return false;
  }
  presenceMap.set(userId, { ...info, socketCount: 1 });
  return true;
}

/**
 * Retire une socket pour un userId.
 * Retourne true si l'utilisateur vient de passer hors-ligne.
 */
export function removeSocket(userId: number): boolean {
  const entry = presenceMap.get(userId);
  if (!entry) return false;
  entry.socketCount--;
  if (entry.socketCount <= 0) {
    presenceMap.delete(userId);
    return true;
  }
  return false;
}

export function getOnlineUsers(): UserPresence[] {
  return [...presenceMap.values()].map(({ id, username, path_img }) => ({ id, username, path_img }));
}

export async function fetchUserInfo(userId: number): Promise<UserPresence | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.username, p.path_img
     FROM \`User\` u
     LEFT JOIN Profile p ON p.id_user = u.id
     WHERE u.id = ?`,
    [userId]
  );
  if (!rows.length) return null;
  return {
    id: rows[0]['id'],
    username: rows[0]['username'],
    path_img: rows[0]['path_img'] ?? null,
  };
}

export async function registerPresenceEvents(io: Server, socket: Socket): Promise<void> {
  const userId = socket.data.userId as number | null;
  if (!userId) return;

  const info = await fetchUserInfo(userId);
  if (!info) return;

  const justCameOnline = addSocket(userId, info);
  socket.emit('online_users', { users: getOnlineUsers().filter(u => u.id !== userId) });
  if (justCameOnline) socket.broadcast.emit('user_online', info);

  socket.on('disconnect', () => {
    const wentOffline = removeSocket(userId);
    if (wentOffline) io.emit('user_offline', { userId });
  });
}
