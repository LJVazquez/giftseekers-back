const Express = require('express');
const Prisma = require('prisma/prisma-client');
const app = Express();
const prisma = new Prisma.PrismaClient();

app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
	res.send('Cabras');
});

app.listen(PORT, () => {
	console.log(`Server en puerto ${PORT}`);
});
