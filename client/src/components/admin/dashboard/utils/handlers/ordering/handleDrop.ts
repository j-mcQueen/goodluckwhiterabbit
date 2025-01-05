import { updateFileCount } from "../../updateFileCounts";

export const handleDrop = async ({ ...params }) => {
  if (params.index === params.draggedIndex && params.source !== "queue") return; // user made a mistake

  // generate presigned URL for file upload
  const presigned = [];
  try {
    // generate the urls used to add each file to S3
    const response = await fetch(`${params.host}/generatePutPresigned`, {
      method: "POST",
      body: JSON.stringify({
        _id: params.targetClient._id,
        imageset: params.targetImageset,
        index: params.index,
        files: [params.file.name, params.fFile.name],
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();

    if (data) {
      switch (response.status) {
        case 200:
        case 304:
          presigned.push(...data);
          break;

        case 401:
          throw new Error("401");

        default:
          throw new Error("Other");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "401") {
        return params.setNotice({
          status: true,
          message:
            "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
          logout: { status: true, path: "/admin" },
        });
      } else {
        return params.setNotice({
          status: true,
          message: "Something went wrong - please try again.",
          logout: { status: false, path: null },
        });
      }
    }
  }

  // TODO can't we just check if there's an existing file at the given index in the order array before executing this request?
  // verify if there is an existing file and remove from S3 if true
  try {
    const response = await fetch(
      `${params.host}/admin/users/${params.targetClient._id}/getFile/${params.targetImageset}/${params.index}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await response.json();

    if (data) {
      switch (response.status) {
        case 200:
        case 304:
          break;

        case 500:
          throw new TypeError(data.message);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return params.setNotice({
        status: true,
        message: error.message,
        logout: { status: false, path: null },
      });
    }
  }

  // // send s3 request and upload images
  try {
    const [response1, response2] = await Promise.all([
      fetch(presigned[0], { method: "PUT", body: params.file }),
      fetch(presigned[1], { method: "PUT", body: params.fFile }),
    ]);

    if (response1.status === 200 && response2.status === 200) {
      // update images locked into order
      const nextImagesetCount =
        params.targetClient.fileCounts[params.targetImageset] + 1;
      const newCounts = await updateFileCount(
        params.host,
        params.targetClient,
        params.targetImageset,
        nextImagesetCount
      );

      const updatedTargetClient = { ...params.targetClient };
      updatedTargetClient.fileCounts = newCounts;
      params.setTargetClient(updatedTargetClient);

      const nextClients = params.clients.map((client: { _id: string }) => {
        return client._id === params.targetClient._id
          ? updatedTargetClient
          : client;
      });
      params.setClients(nextClients);
    } else {
      throw new Error("Other");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      params.setNotice({
        status: true,
        message: "We could not upload your images. Please try again.",
        logout: { status: false, path: null },
      });
    }
  }
};
