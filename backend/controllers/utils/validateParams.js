// for portfolio requests
exports.validateParams = (category, group, size, start) => {
  const acceptedCategories = [
    "PHOTO",
    "EDITORIAL",
    "COMMERCIAL",
    "EVENTS",
    "FILM",
  ];

  if (size !== "sm" && size !== "lg") return { error: "Invalid size" };

  if (Number(group) <= 0 || Number.isInteger(Number(group)) === false)
    return { error: "Invalid group" };

  if (!Number.isInteger(Number(start)) || start < 0 || start > 100)
    return { error: "Invalid start index" };

  if (!acceptedCategories.includes(category)) {
    return { error: "Invalid category" };
  }

  return true;
};
