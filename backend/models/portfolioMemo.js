import mongoose from "mongoose";
const Schema = mongoose.Schema;

// content for a single memo item, referenced by memoId from a group's
// layout (see models/portfolioSubcategory.js). Stored as rendered markup,
// not structured fields - the admin form's fields are flattened to html
// on submit and re-parsed back into the edit dialog client-side.
const PortfolioMemoSchema = new Schema(
  {
    memoId: { type: String, required: true, unique: true },
    category: { type: String, enum: ["PHOTO", "ART", "DESIGN"], required: true },
    html: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("PortfolioMemo", PortfolioMemoSchema);
