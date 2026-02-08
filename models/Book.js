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
});

module.exports = mongoose.model("Book", bookSchema);
