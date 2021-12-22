const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  avatar: { type: String },
  date: { type: String },
});

module.exports = mongoose.model("message", Message);
