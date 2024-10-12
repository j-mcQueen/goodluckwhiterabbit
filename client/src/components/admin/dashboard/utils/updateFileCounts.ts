export const updateFileCount = async (
  host: string,
  client: { _id: string },
  imageset: string,
  count: number
) => {
  const response = await fetch(
    `${host}/admin/users/${client._id}/updateFileCount/${imageset}/${count}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  return await response.json();
};
