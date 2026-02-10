const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	author: {
		type: String,
	},
	status: {
		type: String,
		enum: ['pending', 'approved'],
		default: 'pending'
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
});

module.exports = mongoose.model("Book", bookSchema);
