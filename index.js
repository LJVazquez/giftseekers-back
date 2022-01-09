const express = require('express');
const { PrismaClient } = require('prisma/prisma-client');
const prisma = new PrismaClient();
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const API_VERSION = '/api/v1';

app.get(API_VERSION + '/users', async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			include: { gifts: true },
		});
		res.json(users);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.get(API_VERSION + '/users/:id', async (req, res) => {
	const id = Number(req.params.id);

	try {
		const user = await prisma.user.findUnique({
			where: { id: id },
			include: { gifts: { include: { seekers: true } }, seeking: true },
		});
		res.json(user);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.post(API_VERSION + '/users', async (req, res) => {
	try {
		const { username, password } = req.body;
		const newUser = await prisma.user.create({
			data: {
				username: username,
				password: password,
			},
		});
		res.json(newUser);
		console.log(`newUser`, newUser);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.get(API_VERSION + '/gifts/latest/:amount', async (req, res) => {
	const amount = Number(req.params.amount);

	try {
		const gifts = await prisma.gift.findMany({
			include: { seekers: true },
			orderBy: {
				startDate: 'desc',
			},
			take: amount,
		});
		res.json(gifts);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.get(API_VERSION + '/gifts/hottest/:amount', async (req, res) => {
	const amount = Number(req.params.amount);

	try {
		const gifts = await prisma.gift.findMany({
			include: { seekers: true },
			orderBy: {
				seekers: {
					_count: 'desc',
				},
			},
			take: amount,
		});
		res.json(gifts);
	} catch (e) {
		console.log(`e.message`, e.message);
		res.sendStatus(500);
	}
});

app.get(API_VERSION + '/gifts', async (req, res) => {
	try {
		const gifts = await prisma.gift.findMany();
		res.json(gifts);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.get(API_VERSION + '/gifts/:id', async (req, res) => {
	const id = Number(req.params.id);

	try {
		const gift = await prisma.gift.findUnique({
			where: { id: id },
			include: { author: true, seekers: true },
		});

		res.json(gift);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.post(API_VERSION + '/gifts', decodeToken, async (req, res) => {
	const giftData = req.body;
	const userId = Number(req.user.id);

	try {
		const newGift = await prisma.gift.create({
			data: {
				name: giftData.name,
				description: giftData.description,
				city: giftData.city,
				location: giftData.location,
				lat: Number(giftData.lat),
				lng: Number(giftData.lng),
				difficulty: Number(giftData.difficulty),
				authorId: userId,
				imageUrl: giftData.imageUrl,
			},
		});
		res.json(newGift);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.patch(API_VERSION + '/gifts/:id', decodeToken, async (req, res) => {
	const giftData = req.body;
	const giftId = Number(req.params.id);
	const userId = Number(req.user.id);

	try {
		const gift = await prisma.gift.findUnique({ where: { id: giftId } });

		if (gift.authorId !== userId) {
			return res.sendStatus(401);
		}

		const updatedGift = await prisma.gift.update({
			where: {
				id: giftId,
			},
			data: {
				name: giftData.name,
				description: giftData.description,
				city: giftData.city,
				location: giftData.location,
				lat: Number(giftData.lat),
				lng: Number(giftData.lng),
				difficulty: Number(giftData.difficulty),
				imageUrl: giftData.imageUrl,
			},
		});
		res.json(updatedGift);
	} catch (e) {
		console.log(`e.message`, e.message);

		res.sendStatus(500);
	}
});

app.patch(API_VERSION + '/gifts/:id/seek', decodeToken, async (req, res) => {
	const giftId = Number(req.params.id);
	const userId = Number(req.user.id);

	try {
		const updatedGift = await prisma.gift.update({
			where: {
				id: giftId,
			},
			data: {
				seekers: {
					connect: {
						id: userId,
					},
				},
			},
			include: { seekers: true, author: true },
		});
		res.json(updatedGift);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.patch(API_VERSION + '/gifts/:id/unseek', decodeToken, async (req, res) => {
	const giftId = Number(req.params.id);
	const userId = Number(req.user.id);

	try {
		const updatedGift = await prisma.gift.update({
			where: {
				id: giftId,
			},
			data: {
				seekers: {
					disconnect: {
						id: userId,
					},
				},
			},
			include: { seekers: true, author: true },
		});
		res.json(updatedGift);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.post(API_VERSION + '/login', async (req, res) => {
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
});

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

app.listen(PORT, () => {
	console.log(`Server en puerto ${PORT}`);
});
