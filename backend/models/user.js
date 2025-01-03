const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  code: String,
  fileCounts: {
    previews: Number,
    full: Number,
    socials: Number,
    snips: Number,
  },
  role: String,
  added: String,
});

module.exports = mongoose.model("User", UserSchema);
