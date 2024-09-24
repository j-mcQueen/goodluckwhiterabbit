const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  code: String,
  files: {
    previews: { count: Number, files: Array },
    full: { count: Number, files: Array },
    socials: { count: Number, files: Array },
  },
  role: String,
  added: String,
});

module.exports = mongoose.model("User", UserSchema);
