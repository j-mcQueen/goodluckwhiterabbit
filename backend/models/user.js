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
  links: {
    previews: String,
    full: String,
    socials: String,
    snips: String,
  },
  role: String,
  added: String,
});

module.exports = mongoose.model("User", UserSchema);
