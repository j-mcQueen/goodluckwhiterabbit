import mongoose from "mongoose";
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
    socials: Number,
  },
  role: String,
  added: String,
});

export default mongoose.model("User", UserSchema);
