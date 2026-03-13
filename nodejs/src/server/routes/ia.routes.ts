import express, { Router, Request, Response } from "express";
import { execFile } from "child_process";
import { error } from "console";
import { stderr } from "process";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NiveauParams {
	depth: number;
	errorChance: number; // de 0.0 a 1.0 proba de jouer un coup aleatoire
}

export const levelIA: Record<string, NiveauParams> = {
	novice: { depth: 2, errorChance: 0.4 },
	intermediaire: { depth: 4, errorChance: 0.3 },
	expert: { depth: 6, errorChance: 0.0 },
};

export function getIAMove(fen: string, level: string): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!levelIA[level]) return reject(new Error('Niveau invalide'));
		const IA_ENGINE_PATH = path.join(__dirname, "../ia/ia_engine/ia_engine");
		const { depth, errorChance } = levelIA[level];
		execFile(IA_ENGINE_PATH, [fen, String(depth), String(errorChance)], (err, stdout, stderr) => {
		if (err) return reject(new Error(stderr));
		resolve(stdout.trim());
		});
	});
}

router.post("/move", (req: Request, res: Response) => {
	const {fen, level} = req.body;

	if (!fen || !level || !levelIA[level])
		return res.status(400).json({error: "Parametres invalides"});

	const IA_ENGINE_PATH = path.join(__dirname, "../ia/ia_engine/ia_engine");
	const {depth, errorChance} = levelIA[level];

	execFile (
		IA_ENGINE_PATH,
		[fen, String(depth), String(errorChance)],
		(err, stdout, stderr) => {
			if (err)
			{
				console.error("Erreur ia_engine: ", stderr);
				return res.status(500).json({error: "Erreur moteur IA"});
			}

			const move = stdout.trim();
			return res.json({move});
		}
	);
});

export default router;
