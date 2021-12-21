const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  membershipStatus: { type: Boolean, required: true },
  adminStatus: { type: Boolean, required: true },
});

module.exports = mongoose.model("user", User);
