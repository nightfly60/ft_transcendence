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
	novice: { depth: 1, errorChance: 0.2 }, // 600 elo
	intermediaire: { depth: 2, errorChance: 0.1 }, // 800 elo
	fort: { depth: 6, errorChance: 0.0 }, // 1000 elo
};

router.post("/move", (req: Request, res: Response) => {
	const {fen, level} = req.body;

	console.log(fen);
	console.log(level);
	console.log(levelIA[level].depth);

	if (!fen || !level || !levelIA[level])
		return res.status(400).json({error: "Parametres invalides"});

	const IA_ENGINE_PATH = path.join(__dirname, "../ia/ia_engine/ia_engine");
	const {depth, errorChance} = levelIA[level];
	console.log(IA_ENGINE_PATH);

	execFile (
		IA_ENGINE_PATH,
		[fen, String(depth), errorChance],
		(err, stdout, stderr) => {
			if (err)
			{
				console.error("Erreur ia_engine: ", stderr);
				console.error("Erreur ia_engine stderr:", stderr);
  				console.error("Erreur ia_engine err:", err);
				return res.status(500).json({error: "Erreur moteur IA"});
			}

			const move = stdout.trim();
			return res.json({move});
		}
	);
});


export default router;
