const { PrismaClient } = require('prisma/prisma-client');
const prisma = new PrismaClient();

const index = async (req, res) => {
	try {
		const gifts = await prisma.gift.findMany();
		res.json(gifts);
	} catch (e) {
		res.sendStatus(500);
	}
};

const show = async (req, res) => {
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
};

const store = async (req, res) => {
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
};

const latest = async (req, res) => {
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
};

const hottest = async (req, res) => {
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
};

const update = async (req, res) => {
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
};

const seek = async (req, res) => {
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
};

const unseek = async (req, res) => {
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
};

module.exports = { index, show, store, update, seek, unseek, latest, hottest };
