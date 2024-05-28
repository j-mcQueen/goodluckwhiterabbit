const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//   name: String,
//   email: String,
//   code: String,
//   imageset: [{ type: Schema.Types.ObjectId, ref: "Imageset" }],
// });

const AdminSchema = new Schema({
  username: String,
  password: String,
  role: String,
});

// module.exports = mongoose.model("User", UserSchema);
module.exports = mongoose.model("Admin", AdminSchema);
