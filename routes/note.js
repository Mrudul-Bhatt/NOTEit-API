const express = require('express');
const Note = require('../models/note');
const requireLogin = require('../middleware/requireLogin');

const router = express.Router();

router.get('/allnotes', requireLogin, (req, res) => {
	Post.find()
		.populate('postedBy', '_id name imageUrl')
		.populate('comments.postedBy', '_id name')
		.then((posts) => {
			res.json({ posts });
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.get('/allsubpost', requireLogin, (req, res) => {
	Post.find({ postedBy: { $in: req.user.following } })
		.populate('postedBy', '_id name imageUrl')
		.populate('comments.postedBy', '_id name')
		.then((posts) => {
			res.json({ posts });
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.get('/mynotes', requireLogin, (req, res) => {
	Note.find({ postedBy: req.user._id })
		.populate('postedBy', '_id name')
		.then((mynote) => res.json({ mynote }))
		.catch((error) => {
			console.log(error);
			res.status(500).json({ error: 'Server is down, try again later' });
		});
});

router.put('/like', requireLogin, (req, res) => {
	Post.findByIdAndUpdate(
		req.body.postId,
		{
			$push: { likes: req.user._id },
		},
		{
			new: true,
		}
	)
		.populate('comments.postedBy', '_id name')
		.populate('postedBy', '_id name imageUrl')
		.exec((err, result) => {
			if (err) {
				return res.status(422).json({ error: err });
			} else {
				res.json(result);
			}
		});
});

router.put('/unlike', requireLogin, (req, res) => {
	Post.findByIdAndUpdate(
		req.body.postId,
		{
			$pull: { likes: req.user._id },
		},
		{
			new: true,
		}
	)
		.populate('comments.postedBy', '_id name')
		.populate('postedBy', '_id name imageUrl')
		.exec((err, result) => {
			if (err) {
				return res.status(422).json({ error: err });
			} else {
				res.json(result);
			}
		});
});

router.put('/comments', requireLogin, (req, res) => {
	const comment = {
		text: req.body.text,
		postedBy: req.user._id,
	};

	Post.findByIdAndUpdate(
		req.body.postId,
		{
			$push: { comments: comment },
		},
		{
			new: true,
		}
	)
		.populate('comments.postedBy', '_id name')
		.populate('postedBy', '_id name imageUrl')
		.exec((err, result) => {
			if (err) {
				return res.status(422).json({ error: err });
			} else {
				res.json(result);
			}
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
	const { title, body } = req.body;
	if (!title || !body) {
		return res.status(422).json({ error: 'Please enter all fields' });
	}

	Note.findByIdAndUpdate(
		req.body.noteId,
		{
			title: req.body.title,
			body: req.body.body,
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
	const { title, body } = req.body;
	if (!title || !body) {
		return res.status(422).json({ error: 'Please enter all fields' });
	}
	//baring from storing password in req.user
	req.user.password = undefined;

	const newNote = new Note({
		title,
		body,
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

router.put('/notetags', requireLogin, (req, res) => {
	Note.findById(req.body.noteId)
		.then((result) => {
			if (result.tag.includes(req.body.tag)) {
				return res.status(422).json({ error: 'Tag already exists' });
			}
		})
		.catch((err) => console.log(err));

	Note.findByIdAndUpdate(
		req.body.noteId,
		{
			$push: { tag: req.body.tag },
		},
		{ new: true }
	)
		.populate('postedBy', '_id name')
		.then((data) => {
			res.json({ data, message: 'Tag added' });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Server error' });
		});
});

module.exports = router;
