exports.returnClients = async (user) => {
  const allUsers = await user
    .find(
      {},
      {
        // exclude this information from the query
        email: 0,
        url: 0, // this string includes sensitive S3 creds, so don't include it
        role: 0,
        __v: 0,
      }
    )
    .exec();

  return allUsers;
};
