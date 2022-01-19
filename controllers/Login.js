const { PrismaClient } = require('prisma/prisma-client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

function decodeToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) {
		return res.sendStatus(401);
	}

	jwt.verify(token, process.env.JWT_ACCESS_SECRET, (e, user) => {
		if (e) {
			return res.sendStatus(403);
		}
		req.user = user;
		next();
	});
}

const login = async (req, res) => {
	const { username, password } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: { username: username },
		});

		if (user !== null && user.password === password) {
			const userPayload = { name: user.username, id: user.id };
			const accessToken = jwt.sign(userPayload, process.env.JWT_ACCESS_SECRET);
			res.json({
				id: user.id,
				username: user.username,
				accessToken,
			});
		} else {
			return res.status(401).json({ error: 'usuario o contraseña incorrecta' });
		}
	} catch (e) {
		return res.status(401).json({ error: 'usuario o contraseña incorrecta' });
	}
};

module.exports = { decodeToken, login };
