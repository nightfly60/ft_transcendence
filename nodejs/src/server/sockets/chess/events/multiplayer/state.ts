import { MultiGame } from '../../types.js';

/** Délai en ms avant qu'un joueur déconnecté soit déclaré forfait. */
export const DISCONNECT_TIMEOUT_MS = 60_000;

/** Socket ID du joueur en file d'attente, ou null si la file est vide. */
export let waitingPlayer: string | null = null;

/** Parties en cours, indexées par gameId. */
export const multiGames = new Map<string, MultiGame>();

/** Association userId → gameId pour retrouver la partie active d'un joueur. */
export const playerGames = new Map<number, string>();

/** Timers de forfait actifs, indexés par `${gameId}:${userId}`. */
export const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** Offres de nulle en cours, indexées par gameId (valeur : socketId de l'offreur). */
export const drawOffers = new Map<string, string>();

/**
 * @brief Met à jour le joueur en attente de match.
 *
 * @param id Socket ID du joueur à mettre en attente, ou null pour vider la file.
 */
export function setWaitingPlayer(id: string | null): void {
  waitingPlayer = id;
}
