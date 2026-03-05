import { Router } from 'express';
const router = Router();

function validateEmail(mail: string): boolean {
	var re = /\S+@\S+\.\S+/;
	return re.test(mail);
}

router.post('/register', (req, res) => {
	const { username, password, email } = req.body;

	console.log("==== DATAS RECUS =====");
	console.log("user: ", username);
	console.log("mail: ", email);

	if (!validateEmail(email)) {
		res.status(400).json({ message: 'Adresse Email incorrecte', email });
		return ;
	}

	res.status(201).json({ message: 'Compte cree avec succes', username });
});

router.post('/login', (req, res) => {
	const { password, email } = req.body;

	console.log("==== DATAS RECUS =====");
	console.log("mail: ", email);
	console.log("password: ", password);

	if (!validateEmail(email)) {
		res.status(400).json({ message: 'Adresse Email incorrecte', email });
		return ;
	}

	res.status(200).json({ message: 'Connecte' });
});

export default router;
