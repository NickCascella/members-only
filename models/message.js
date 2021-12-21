const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = new Schema({
  message: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  avatar: { type: String },
});

module.exports = mongoose.model("message", Message);
