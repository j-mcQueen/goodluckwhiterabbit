const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  username: String,
  password: String,
  role: String,
});

module.exports = mongoose.model("Admin", AdminSchema);
