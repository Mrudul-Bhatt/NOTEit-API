//Package Imports
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//File Imports
const User = require('../models/user');
const { JWT_SECRET_KEY } = require('../config/dev');

const router = express.Router();

router.post('/signup', (req, res) => {
	const { name, email, password } = req.body;

	if (!email || !password || !name) {
		return res.status(422).json({ error: 'Please enter all fields' });
	}

	User.findOne({ email: email })
		.then((savedUser) => {
			if (savedUser) {
				return res.status(422).json({ error: 'Email already exists' });
			}

			bcrypt
				.hash(password, 12)
				.then((hashedPassword) => {
					const newUser = new User({
						email,
						password: hashedPassword,
						name,
					});
					newUser
						.save()
						.then((user) =>
							res.json({ message: 'Account created successfully' })
						)
						.catch((error) => {
							console.log(error);
							return res
								.status(500)
								.json({ error: 'Server is down, try again later' });
						});
				})
				.catch((error) => {
					console.log(error);
					return res
						.status(500)
						.json({ error: 'Server is down, try again later' });
				});
		})
		.catch((error) => {
			console.log(error);
			return res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.post('/signin', (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(422).json({ error: 'Please enter all fields' });
	}
	User.findOne({ email: email })
		.then((savedUser) => {
			if (!savedUser) {
				return res.status(422).json({ error: 'Wrong email or password!' });
			}
			bcrypt
				.compare(password, savedUser.password)
				.then((doMatch) => {
					if (doMatch) {
						//generating token on basis of userId (_id)
						const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET_KEY);
						const { _id, name, email } = savedUser;
						res.json({
							message: 'Signin success',
							token,
							user: { _id, name, email },
						});
					} else {
						return res.status(422).json({ error: 'Wrong email or password!' });
					}
				})
				.catch((error) => {
					console.log(error);
					return res
						.status(500)
						.json({ error: 'Server is down, try again later' });
				});
		})
		.catch((error) => {
			console.log(error);
			return res.status(500).json({ error: 'Server is down, try again later' });
		});
});

module.exports = router;
