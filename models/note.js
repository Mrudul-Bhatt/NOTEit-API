const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		body: { type: String, required: true },
		dateCreated: { type: String, required: true },
		dateUpdated: { type: String, required: true, default: 'Never' },
		favourite: { type: Boolean, default: false, required: true },
		postedBy: { type: ObjectId, ref: 'User' },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Post', postSchema);
