const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { MONGO_URI } = require('./config/keys');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

//Routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/note');
const userRoutes = require('./routes/user');

//Middlewares
app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use(noteRoutes);
app.use(userRoutes);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'));
	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

//Db
mongoose
	.connect(MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => console.log('MongoDb connected!'))
	.catch((error) => console.log(error));

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
