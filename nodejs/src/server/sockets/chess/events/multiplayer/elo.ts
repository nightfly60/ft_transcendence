import { RowDataPacket } from 'mysql2';
import pool from '../../../../db.js';

/** Facteur K utilisé dans le calcul ELO (amplitude maximale de gain/perte par partie). */
const ELO_K = 32;

/**
 * @brief Recalcule et met à jour l'ELO des deux joueurs après une partie.
 *
 * Utilise la formule ELO standard : R' = R + K * (S - E)
 * où E = 1 / (1 + 10^((Ro - R) / 400)) est le score attendu
 * et S vaut 1 (victoire), 0.5 (nulle) ou 0 (défaite).
 * L'ELO ne peut pas descendre en dessous de 0.
 *
 * @param winnerId    Id du gagnant, ou null en cas de nulle.
 * @param whiteUserId Id du joueur qui avait les blancs.
 * @param blackUserId Id du joueur qui avait les noirs.
 */
export async function updateElo(winnerId: number | null, whiteUserId: number, blackUserId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id_user, elo FROM Profile WHERE id_user IN (?, ?)',
    [whiteUserId, blackUserId]
  );
  const eloMap: Record<number, number> = {};
  (rows as RowDataPacket[]).forEach(r => { eloMap[r['id_user']] = Number(r['elo']); });

  const eloW = eloMap[whiteUserId] ?? 400;
  const eloB = eloMap[blackUserId] ?? 400;

  const expectedW = 1 / (1 + Math.pow(10, (eloB - eloW) / 400));
  const expectedB = 1 - expectedW;

  let scoreW: number, scoreB: number;
  if (winnerId === null)            { scoreW = 0.5; scoreB = 0.5; }
  else if (winnerId === whiteUserId) { scoreW = 1;   scoreB = 0;   }
  else                               { scoreW = 0;   scoreB = 1;   }

  const newEloW = Math.max(0, Math.round(eloW + ELO_K * (scoreW - expectedW)));
  const newEloB = Math.max(0, Math.round(eloB + ELO_K * (scoreB - expectedB)));

  await Promise.all([
    pool.query('UPDATE Profile SET elo = ? WHERE id_user = ?', [newEloW, whiteUserId]),
    pool.query('UPDATE Profile SET elo = ? WHERE id_user = ?', [newEloB, blackUserId]),
  ]);
}
