const mongoose = require("mongoose");
const { Schema } = mongoose;

const threadModel = new Schema({
	threadID: {
		type: String,
		unique: true
	},
	threadName: String,
  adminIDs: {
		type: Array,
		default: []
	},
	members: {
		type: Array,
		default: []
	},
	banned: {
		type: Object,
		default: {}
	},
	settings: {
		type: Object,
		default: {}
	},
	data: {
		type: Object,
		default: {}
	},
	isGroup: Boolean
}, {
	timestamps: true,
	minimize: false
});

module.exports = mongoose.model("threads", threadModel);