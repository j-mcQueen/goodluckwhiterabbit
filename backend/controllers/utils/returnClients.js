exports.returnClients = async (user) => {
  const allUsers = await user
    .find(
      {},
      {
        // exclude this information from the query
        email: 0,
        role: 0,
        __v: 0,
      }
    )
    .exec();

  return allUsers;
};
