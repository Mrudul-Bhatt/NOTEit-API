const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
	title: { type: String, required: true },
	body: { type: String, required: true },
	tag: { type: String },
	// imageUrl: { type: String, required: true },
	favourite: { type: Boolean, default: false, required: true },
	// comments: [
	// 	{
	// 		text: { type: String },
	// 		postedBy: {
	// 			type: ObjectId,
	// 			ref: 'User',
	// 		},
	// 	},
	// ],
	postedBy: { type: ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Post', postSchema);
