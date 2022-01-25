const { gql, UserInputError } = require('apollo-server');
const { PrismaClient } = require('prisma/prisma-client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const typeDefs = gql`
	type User {
		id: Int!
		username: String!
		gifts: [Gift!]!
		seeking: [Gift!]
	}

	type Gift {
		id: Int!
		active: Boolean!
		name: String!
		description: String!
		city: City!
		location: String!
		lat: Float!
		lng: Float!
		difficulty: Int!
		startDate: String!
		author: User!
		authorId: Int!
		imageUrl: String
		seekers: [User!]
		seekersCount: Int!
	}

	type Token {
		id: Int!
		username: String!
		value: String!
	}

	enum City {
		AGRONOMIA
		ALMAGRO
		BALVANERA
		BARRACAS
		BELGRANO
		BOEDO
		CABALLITO
		CHACARITA
		COGHLAN
		COLEGIALES
		CONSTITUCION
		FLORES
		FLORESTA
		LA_BOCA
		LA_PATERNAL
		LINIERS
		MATADEROS
		MONTE_CASTRO
		MONTSERRAT
		NUEVA_POMPEYA
		NUNEZ
		PALERMO
		PARQUE_AVELLANEDA
		PARQUE_CHACABUCO
		PARQUE_CHAS
		PARQUE_PATRICIOS
		PUERTO_MADERO
		RECOLETA
		RETIRO
		SAAVEDRA
		SAN_CRISTOBAL
		SAN_NICOLAS
		SAN_TELMO
		VERSALLES
		VILLA_CRESPO
		VILLA_DEVOTO
		VILLA_GENERAL_MITRE
		VILLA_LUGANO
		VILLA_LURO
		VILLA_ORTUZAR
		VILLA_PUEYRREDON
		VILLA_REAL
		VILLA_RIACHUELO
		VILLA_SANTA_RITA
		VILLA_SOLDATI
		VILLA_URQUIZA
		VILLA_DEL_PARQUE
		VELEZ_SARSFIELD
	}

	type Query {
		users: [User!]!
		user(id: Int!): User
		gifts: [Gift!]!
		gift(id: Int!): Gift
		latestGifts(amount: Int!): [Gift!]!
	}

	type Mutation {
		registerUser(username: String!, password: String!): User
		createGift(
			name: String!
			description: String!
			city: City!
			location: String!
			lat: Float!
			lng: Float!
			difficulty: Int!
			imageUrl: String!
		): Gift
		login(username: String!, password: String!): Token
	}
`;

const resolvers = {
	Query: {
		users: async () => {
			const users = await prisma.user.findMany({
				include: { gifts: true, seeking: true },
			});
			return users;
		},
		user: async (parent, args) => {
			const user = await prisma.user.findUnique({
				where: { id: args.id },
			});

			return user;
		},
		gifts: async () => {
			const gifts = await prisma.gift.findMany({ include: { seekers: true } });
			return gifts;
		},
		gift: async (parent, args) => {
			const gift = await prisma.gift.findUnique({
				where: { id: args.id },
				include: { seekers: true },
			});

			return gift;
		},
		latestGifts: async (parent, args) => {
			const gifts = await prisma.gift.findMany({
				include: { seekers: true },
				orderBy: {
					startDate: 'desc',
				},
				take: args.amount,
			});

			return gifts;
		},
	},
	Mutation: {
		registerUser: async (parent, args) => {
			const newUser = await prisma.user.create({
				data: {
					username: args.username,
					password: args.password,
				},
			});
			return newUser;
		},
		createGift: async (parent, args, context) => {
			if (!context.user) {
				throw new UserInputError('Auth error');
			}

			const loggedUser = context.user;

			try {
				const newGift = await prisma.gift.create({
					data: {
						name: args.name,
						description: args.description,
						city: args.city,
						location: args.location,
						lat: Number(args.lat),
						lng: Number(args.lng),
						difficulty: Number(args.difficulty),
						authorId: loggedUser.id,
						imageUrl: args.imageUrl,
						active: true,
					},
				});
				return newGift;
			} catch (e) {
				console.log('e.message', e.message);
				throw new UserInputError(e.message);
			}
		},
		login: async (parent, args) => {
			const { username, password } = args;

			try {
				const user = await prisma.user.findUnique({
					where: { username: username },
				});

				if (user !== null && user.password === password) {
					const userPayload = { name: user.username, id: user.id };
					const accessToken = jwt.sign(
						userPayload,
						process.env.JWT_ACCESS_SECRET
					);
					return {
						id: user.id,
						username: user.username,
						value: accessToken,
					};
				} else {
					throw new UserInputError('Usuario y/o contraseña incorrecto/s');
				}
			} catch (e) {
				console.log('e.message', e.message);
				throw new UserInputError(e.message);
			}
		},
	},
	User: {
		gifts: async (parent) => {
			const gifts = await prisma.gift.findMany({
				where: { authorId: parent.id },
				include: {
					seekers: true,
				},
			});

			return gifts;
		},
		seeking: async (parent) => {
			const user = await prisma.user.findUnique({
				where: { id: parent.id },
				include: { seeking: true },
			});

			return user.seeking;
		},
	},
	Gift: {
		author: async (parent) => {
			const user = await prisma.user.findUnique({
				where: { id: parent.authorId },
			});
			return user;
		},
		seekers: async (parent) => {
			return parent.seekers;
		},
		seekersCount: async (parent) => {
			return parent.seekers ? parent.seekers.length : 0;
		},
	},
};

module.exports = { typeDefs, resolvers };
