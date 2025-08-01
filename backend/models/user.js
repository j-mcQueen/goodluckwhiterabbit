const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  code: String,
  category: String,
  fileCounts: {
    snapshots: Number,
    keepsake: Number,
    core: Number,
    snips: Number,
  },
  role: String,
  added: String,
});

module.exports = mongoose.model("User", UserSchema);
