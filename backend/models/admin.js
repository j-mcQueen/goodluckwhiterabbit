const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  code: String,
  imageset: [{ type: Schema.Types.ObjectId, ref: "Imageset" }],
});

module.exports = mongoose.model("User", UserSchema);
