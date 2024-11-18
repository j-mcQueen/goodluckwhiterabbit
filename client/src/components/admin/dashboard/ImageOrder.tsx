import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { updateFileCount } from "./utils/updateFileCounts";
import { handleDragStart } from "./utils/handleDragStart";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";

import Close from "../../../assets/media/icons/Close";

export default function ImageOrder({ ...props }) {
  const {
    host,
    clients,
    setClients,
    setNotice,
    renderCount,
    setRenderCount,
    targetClient,
    setTargetClient,
    targetImageset,
    orderedImageset,
    setSpinner,
  } = props;

  const [order, setOrder] = useState(orderedImageset);

  const handleDrop = async (
    file: File,
    index: number,
    draggedIndex: number,
    source: string
  ) => {
    if (index === draggedIndex && source !== "queue") return; // user made a mistake

    // generate presigned URL for file upload
    let presigned = "";
    try {
      // generate the url used to add the file to S3
      const response = await fetch(`${host}/generatePutPresigned`, {
        method: "POST",
        body: JSON.stringify({
          _id: targetClient._id,
          imageset: targetImageset,
          index,
          filename: file.name,
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
          return setNotice({
            status: true,
            message:
              "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
            logout: { status: true, path: "/admin" },
          });
        } else {
          return setNotice({
            status: true,
            message: "Something went wrong - please try again.",
            logout: { status: false, path: null },
          });
        }
      }
    }

    // verify if there is an existing file and remove from S3 if true
    try {
      const response = await fetch(
        `${host}/admin/users/${targetClient._id}/getFile/${targetImageset}/${index}`,
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
        return setNotice({
          status: true,
          message: error.message,
          logout: { status: false, path: null },
        });
      }
    }

    // send s3 request and upload single image
    try {
      const response = await fetch(presigned, {
        method: "PUT",
        body: file,
      });

      if (response.status === 200 || response.status === 304) {
        // update images locked into order
        const updatedOrder = [...order];
        updatedOrder[index] = file;
        setOrder(updatedOrder);

        const nextImagesetCount = targetClient.fileCounts[targetImageset] + 1;
        const newCounts = await updateFileCount(
          host,
          targetClient,
          targetImageset,
          nextImagesetCount
        );

        const updatedTargetClient = { ...targetClient };
        updatedTargetClient.fileCounts = newCounts;
        setTargetClient(updatedTargetClient);

        const nextLoaded = renderCount + 1;
        setRenderCount(nextLoaded);

        const nextClients = clients.map((client: { _id: string }) => {
          return client._id === targetClient._id ? updatedTargetClient : client;
        });
        setClients(nextClients);
      } else {
        throw new Error("Other");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        setNotice({
          status: true,
          message: "We could not upload your image. Please try again.",
          logout: { status: false, path: null },
        });
      }
    }
  };

  const handleLoadClick = async () => {
    if (renderCount === targetClient.fileCounts[targetImageset]) {
      const nextOrder = [...order, ...Array(10).fill({})];
      return setOrder(nextOrder);
    } else if (renderCount < targetClient.fileCounts[targetImageset]) {
      setSpinner(true);

      const imagesetLength = order.length;
      const data = await executeGenerationChain(
        order,
        targetImageset,
        setNotice,
        imagesetLength,
        imagesetLength + 10,
        targetClient._id
      );

      const count = renderCount + data.count;
      const response = await fetch(
        `${host}/admin/users/${targetClient._id}/updateFileCount/${targetImageset}/${count}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const newCounts = await response.json();

      if (newCounts && (response.status === 200 || response.status === 304)) {
        const nextTargetClient = { ...targetClient };
        nextTargetClient.fileCounts[targetImageset] = newCounts[targetImageset];
        setTargetClient(nextTargetClient);

        const nextClients = clients.map((client: { _id: string }) => {
          return client._id === targetClient._id ? nextTargetClient : client;
        });
        setClients(nextClients);

        const nextOrder = data.files;
        setOrder(nextOrder);

        const rendered = nextOrder.filter(
          (item: object | File) => item instanceof File
        ).length;
        setRenderCount(rendered);

        setSpinner(false);
        return;
      }
    }
  };

  const handleDeleteClick = async (index: number, filename: string) => {
    try {
      const response = await fetch(
        `${host}/admin/users/${targetClient._id}/${targetImageset}/${index}/${filename}/delete`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data && (response.status === 200 || response.status === 304)) {
        const updatedOrder = [...order];
        updatedOrder[index] = {};
        setOrder(updatedOrder);

        // update imagesetCount
        const nextImagesetCount = targetClient.fileCounts[targetImageset] - 1;
        const newCounts = await updateFileCount(
          host,
          targetClient,
          targetImageset,
          nextImagesetCount
        );

        const updatedTargetClient = { ...targetClient };
        updatedTargetClient.fileCounts = newCounts;
        setTargetClient(updatedTargetClient);

        const nextClients = clients.map((client: { _id: string }) => {
          return client._id === targetClient._id ? updatedTargetClient : client;
        });
        setClients(nextClients);

        const nextLoaded = renderCount - 1;
        setRenderCount(nextLoaded);
        return;
      }
    } catch (error) {
      return setNotice({
        status: true,
        message:
          "There was an error deleting this image. Please refresh the page and try again.",
        logout: { status: false, path: null },
      });
    }
  };

  return (
    <div className="flex items-start">
      <div className="text-white p-3 min-w-[40vw] flex flex-col items-center justify-center overflow-scroll">
        <div className="flex flex-col items-center ">
          <div className="flex flex-wrap justify-center max-w-[60dvw] gap-5 px-5 overflow-scroll relative">
            {order.map((file: File | object, index: number) => {
              return (
                <div key={uuidv4()}>
                  {file instanceof File ? (
                    <button
                      onClick={() => handleDeleteClick(index, file.name)}
                      className="absolute bg-black m-1 border border-solid border-rd p-1"
                    >
                      <Close className="w-4 h-4" />
                    </button>
                  ) : null}

                  <img
                    loading="lazy"
                    draggable={true}
                    onDragStart={(e) =>
                      file instanceof File
                        ? handleDragStart(e, file, "order", index)
                        : null
                    }
                    onDrop={(e) => {
                      const draggedIndex = Number(
                        e.dataTransfer.getData("text/index")
                      );
                      const source = e.dataTransfer.getData("text/source");
                      const file = e.dataTransfer.files[0];

                      handleDrop(file, index, draggedIndex, source);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className={`${file instanceof File === false ? "h-[300px] w-[200px]" : "min-h-[300px] max-h-[350px]"} border border-solid`}
                    src={file instanceof File ? URL.createObjectURL(file) : ""}
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleLoadClick()}
            type="button"
            className="font-tnrBI tracking-widest opacity-80 drop-shadow-glo border border-solid px-4 py-2 xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red transition-colors mt-8 mb-5"
          >
            LOAD NEXT BATCH
          </button>
        </div>
      </div>
    </div>
  );
}
