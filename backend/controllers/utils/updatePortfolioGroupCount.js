export const updatePortfolioGroupCount = async (
  subId,
  groupId,
  res,
  PortfolioSubcategory,
  value,
) => {
  try {
    const updated = await PortfolioSubcategory.findOneAndUpdate(
      { _id: subId, "groups.groupId": groupId },
      { $inc: { "groups.$.count": value } },
      { new: true },
    );

    return updated;
  } catch (error) {
    return res
      .status(304)
      .json(
        "We have uploaded your files, but there was a database error. Your file count may not be accurate",
      );
  }
};
