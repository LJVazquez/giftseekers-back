const express = require('express');
const cors = require('cors');

const PORT = 3001;
const API_VERSION = '/api/v1';

const app = express();
app.use(cors());
app.use(express.json());

const userRouter = require('./routes/User');
const giftRouter = require('./routes/Gift');
const loginRouter = require('./routes/Login');

app.use(API_VERSION + '/users', userRouter);
app.use(API_VERSION + '/gifts', giftRouter);
app.use(API_VERSION + '/login', loginRouter);

app.listen(PORT, () => {
	console.log(`Server en puerto ${PORT}`);
});
