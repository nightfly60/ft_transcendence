import { levelIA } from "../routes/ia.routes.js";
// en fonction du niveau, on regarde si on envoie le meilleur coup ou un coup random
export function selectMove(move, level) {
    const { errorChance } = levelIA[level];
    if (Math.random() < errorChance)
        return ({ move: "random", mate: null, promotion: null }); // envoyer random pour prendre un coup au pif dans les coups legaux
    return (move); // renvoyer un vrai coup
}
