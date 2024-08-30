const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  code: String,
  files: { previews: Number, full: Number, socials: Number },
  role: String,
  added: String,
});

module.exports = mongoose.model("User", UserSchema);
