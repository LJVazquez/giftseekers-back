const { gql } = require('apollo-server');
const { PrismaClient } = require('prisma/prisma-client');

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
