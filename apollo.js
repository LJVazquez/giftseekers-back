const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schemas/schema');
const jwt = require('jsonwebtoken');

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => {
		let token = req.headers.authorization || null;

		let user = null;

		if (token) {
			token = token.split(' ')[1];

			jwt.verify(token, process.env.JWT_ACCESS_SECRET, (e, decodedData) => {
				if (e) {
					console.log('Error en token', e.message);
				}
				user = decodedData;
			});
		}
		return { user };
	},
});

server.listen().then(({ url }) => {
	console.log(`Server running at ${url}`);
});
