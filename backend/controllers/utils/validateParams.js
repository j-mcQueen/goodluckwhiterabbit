import PortfolioSubcategory from "../../models/portfolioSubcategory.js";

// for portfolio requests
export const validateParams = async (category, sub, group, size, start) => {
  const acceptedCategories = ["PHOTO", "ART", "DESIGN"];

  if (size !== "sm" && size !== "lg") return { error: "Invalid size" };

  if (Number(group) <= 0 || Number.isInteger(Number(group)) === false)
    return { error: "Invalid group" };

  if (!Number.isInteger(Number(start)) || start < 0 || start > 100)
    return { error: "Invalid start index" };

  if (!acceptedCategories.includes(category)) {
    return { error: "Invalid category" };
  }

  const subcategory = await PortfolioSubcategory.findOne({
    category,
    name: sub,
  });
  if (!subcategory) return { error: "Invalid sub" };

  return true;
};
