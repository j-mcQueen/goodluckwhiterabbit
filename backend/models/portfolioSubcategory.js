import mongoose from "mongoose";
const Schema = mongoose.Schema;

// one entry per rendered item in a group, in display order - images are
// identified by their S3 `_{position}` filename suffix (see portfolioAdmin.js),
// memos by memoId (see models/portfolioMemo.js). Decoupled from S3 image
// position on purpose: memo insert/delete/reorder never renumbers images.
const LayoutItemSchema = new Schema(
  {
    type: { type: String, enum: ["image", "memo"], required: true },
    position: { type: Number }, // required when type === "image"
    memoId: { type: String }, // required when type === "memo"
  },
  { _id: false },
);

const GroupSchema = new Schema({
  groupId: { type: String, required: true }, // zero-padded "001".."999", literal S3 path segment
  name: { type: String, required: true }, // display name
  order: { type: Number, required: true },
  count: { type: Number, default: 0 }, // fileCounts-equivalent, self-healed against S3 like User.fileCounts
  layout: { type: [LayoutItemSchema], default: [] }, // self-healed against S3 the same way count is - see adminGetPortfolioGroupImages
});

const PortfolioSubcategorySchema = new Schema(
  {
    category: { type: String, enum: ["PHOTO", "ART", "DESIGN"], required: true },
    name: { type: String, required: true }, // literal S3 `sub` path segment (uppercase)
    order: { type: Number, required: true },
    nextGroupSeq: { type: Number, default: 1 }, // monotonic, never reused across deletes
    groups: [GroupSchema],
  },
  { timestamps: true },
);

PortfolioSubcategorySchema.index({ category: 1, name: 1 }, { unique: true });

export default mongoose.model("PortfolioSubcategory", PortfolioSubcategorySchema);
