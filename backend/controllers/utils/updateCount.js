exports.updateCount = async (_id, imageset, res, User, value) => {
  try {
    const updated = await User.findByIdAndUpdate(
      _id,
      {
        $inc: {
          [`fileCounts.${imageset}`]: value,
        },
      },
      { new: true }
    );

    return updated;
  } catch (error) {
    return res
      .status(304)
      .json(
        "We have uploaded your files, but there was a database error. Your file count may not be accurate"
      );
  }
};
