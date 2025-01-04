import { updateFileCount } from "../../updateFileCounts";

export const handleDrop = async ({ ...params }) => {
  if (params.index === params.draggedIndex && params.source !== "queue") return; // user made a mistake

  // generate presigned URL for file upload
  let presigned = "";
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
          presigned = data;
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

  // verify if there is an existing file and remove from S3 if true
  // try {
  //   const response = await fetch(
  //     `${params.host}/admin/users/${params.targetClient._id}/getFile/${params.targetImageset}/${params.index}`,
  //     {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //     }
  //   );
  //   const data = await response.json();

  //   if (data) {
  //     switch (response.status) {
  //       case 200:
  //       case 304:
  //         break;

  //       case 500:
  //         throw new TypeError(data.message);
  //     }
  //   }
  // } catch (error) {
  //   if (error instanceof Error) {
  //     return params.setNotice({
  //       status: true,
  //       message: error.message,
  //       logout: { status: false, path: null },
  //     });
  //   }
  // }

  // // send s3 request and upload single image
  // try {
  //   const response = await fetch(presigned, {
  //     method: "PUT",
  //     body: params.file,
  //   });

  //   if (response.status === 200 || response.status === 304) {
  //     // update images locked into order
  //     const updatedOrder = [...params.order];
  //     updatedOrder[params.index] = params.file;
  //     params.setOrder(updatedOrder);

  //     const nextImagesetCount =
  //       params.targetClient.fileCounts[params.targetImageset] + 1;
  //     const newCounts = await updateFileCount(
  //       params.host,
  //       params.targetClient,
  //       params.targetImageset,
  //       nextImagesetCount
  //     );

  //     const updatedTargetClient = { ...params.targetClient };
  //     updatedTargetClient.fileCounts = newCounts;
  //     params.setTargetClient(updatedTargetClient);

  //     const nextLoaded = params.renderCount + 1;
  //     params.setRenderCount(nextLoaded);

  //     const nextClients = params.clients.map((client: { _id: string }) => {
  //       return client._id === params.targetClient._id
  //         ? updatedTargetClient
  //         : client;
  //     });
  //     params.setClients(nextClients);
  //   } else {
  //     throw new Error("Other");
  //   }
  // } catch (error) {
  //   if (error instanceof Error) {
  //     console.log(error);
  //     params.setNotice({
  //       status: true,
  //       message: "We could not upload your image. Please try again.",
  //       logout: { status: false, path: null },
  //     });
  //   }
  // }
};
