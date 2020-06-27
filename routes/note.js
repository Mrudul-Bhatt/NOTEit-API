const express = require('express');
const Note = require('../models/note');
const requireLogin = require('../middleware/requireLogin');
const moment = require('moment');
const router = express.Router();

router.get('/mynotes', requireLogin, (req, res) => {
	Note.find({ postedBy: req.user._id })
		.populate('postedBy', '_id name')
		.sort('-createdAt')
		.then((mynote) => res.json({ mynote }))
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.delete('/deletenote', requireLogin, (req, res) => {
	Note.findOne({ _id: req.body.postId })
		.populate('postedBy', '_id name')
		.exec((err, note) => {
			if (err || !note) {
				return res.status(422).json({ error: err });
			}
			if (note.postedBy._id.toString() === req.user._id.toString()) {
				note
					.remove()
					.then((result) => {
						res.json({ message: 'Note deleted successfully', result });
					})
					.catch((error) => {
						res.status(500).json({ error: 'Server is down, try again later' });
						console.log(error);
					});
			}
		});
});

router.get('/singlenote/:noteId', requireLogin, (req, res) => {
	Note.findOne({ _id: req.params.noteId })
		.populate('postedBy', '_id name')
		.then((mynote) => res.json({ mynote }))
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.get('/updatenote/:noteId', requireLogin, (req, res) => {
	Note.findOne({ _id: req.params.noteId })
		.populate('postedBy', '_id name')
		.then((mynote) => res.json({ mynote }))
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.put('/updatenote', requireLogin, (req, res) => {
	const { title, body, date } = req.body;
	if (!title || !body) {
		return res.status(422).json({ error: 'Please enter all fields' });
	}
	//var date = moment().format('MMMM Do YYYY');
	//var date = moment().format('lll').toString();
	//var date = moment.utc().toString();

	Note.findByIdAndUpdate(
		req.body.noteId,
		{
			title: req.body.title,
			body: req.body.body,
			dateUpdated: date,
		},
		{ new: true }
	)
		.populate('postedBy', '_id name')
		.then((data) => {
			res.json({ message: 'Note updated', data });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Server error' });
		});
});

router.post('/createnote', requireLogin, (req, res) => {
	const { title, body, date } = req.body;
	if (!title || !body) {
		return res.status(422).json({ error: 'Please enter all fields' });
	}
	//baring from storing password in req.user
	req.user.password = undefined;
	//var date = moment().format('MMMM Do YYYY');
	//var date = moment().format('lll').toString();
	//var date = moment.utc().format().toString();

	const newNote = new Note({
		title,
		body,
		dateCreated: date,
		postedBy: req.user,
	});

	newNote
		.save()
		.then((createdNote) => {
			res.json({ createdNote, message: 'Note added' });
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.put('/favourite', requireLogin, (req, res) => {
	Note.findByIdAndUpdate(
		req.body.postId,
		{
			$set: { favourite: true },
		},
		{ new: true }
	)
		.populate('postedBy', '_id name')
		.then((data) => {
			res.json({ data });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Server error' });
		});
});

router.put('/unfavourite', requireLogin, (req, res) => {
	Note.findByIdAndUpdate(
		req.body.postId,
		{
			$set: { favourite: false },
		},
		{ new: true }
	)
		.populate('postedBy', '_id name')
		.then((data) => {
			res.json({ data });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Server error' });
		});
});

router.post('/searchnotes', requireLogin, (req, res) => {
	let notePattern = new RegExp('^' + req.body.query);
	Note.find({ title: { $regex: notePattern } })
		.populate('postedBy', '_id name')
		.then((result) => {
			res.json({ result });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Server Error' });
		});
});

module.exports = router;
