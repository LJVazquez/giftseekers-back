const { PrismaClient } = require('prisma/prisma-client');
const prisma = new PrismaClient();

const index = async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			include: { gifts: true },
		});
		res.json(users);
	} catch (e) {
		res.sendStatus(500);
	}
};

const show = async (req, res) => {
	const id = Number(req.params.id);

	try {
		const user = await prisma.user.findUnique({
			where: { id: id },
			include: {
				gifts: { include: { seekers: true } },
				seeking: { include: { seekers: true } },
			},
		});
		res.json(user);
	} catch (e) {
		res.sendStatus(500);
	}
};

const store = async (req, res) => {
	try {
		const { username, password } = req.body;
		const newUser = await prisma.user.create({
			data: {
				username: username,
				password: password,
			},
		});
		res.json(newUser);
	} catch (e) {
		res.sendStatus(500);
	}
};

module.exports = { index, show, store };
