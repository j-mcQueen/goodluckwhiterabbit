import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Loading from "../../global/Loading";
import Close from "../../../assets/media/icons/Close";

export default function ImageOrder({ ...props }) {
  const {
    host,
    setNotice,
    targetClient,
    targetImageset,
    orderedImagesets,
    setOrderedImagesets,
    imagesetCounts,
    setImagesetCounts,
    spinner,
    // setSpinner,
  } = props;

  const headingText: headingTextType = {
    previews: "PREVIEWS",
    full: "GALLERY",
    socials: "SOCIAL",
  };

  interface headingTextType {
    previews: string;
    full: string;
    socials: string;
  }

  const [queuedImages, setQueuedImages] = useState(() => {
    if (targetClient.queue !== undefined) {
      return [...targetClient.queue[targetImageset]];
    } else return [];
  });

  const [loaded, setLoaded] = useState(
    orderedImagesets[targetImageset].filter(
      (item: object | File) => item instanceof File
    ).length
  ); // helps determine where to loop from when user wants to load more files (represents actual number of files loaded from storage)

  const handleDragStart = (
    e: React.DragEvent<HTMLImageElement>,
    file: File,
    source: string,
    index: number
  ) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/uri", URL.createObjectURL(file));
      e.dataTransfer.setData("text/plain", URL.createObjectURL(file));
      e.dataTransfer.setData("text/index", String(index));
      e.dataTransfer.setData("text/source", source);
    }
    return;
  };

  const handleDrop = async (
    index: number,
    draggedIndex: number,
    source: string
  ) => {
    // TODO potential solution to handle previously-ordered images being dragged to new positions:
    // intended functionality is that when this happens every following object moves up an index
    // 1. server needs to be able to determine when this happens, so supply source parameter to fetch body
    // 2. on server-side, update all keys of s3 objects in targetImageset from index onwards (increases by 1) if req.body.source is "order"
    // 3. object at dragged index must then be removed, so generate url to perform this action
    // 4. after url generation, fetch to the url to remove object at dragged index
    // 5. iterate over all ordered images for the targetImageset and update their indexes and remove object at dragged index on client in state
    // for now, we are assuming image has been dragged from queuedImages

    if (index === draggedIndex && source !== "queue") return; // user made a mistake

    // generate presigned URL for file upload
    const file =
      source === "queue"
        ? queuedImages[draggedIndex]
        : orderedImagesets[targetImageset].files[draggedIndex];
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
        const updatedImagesetOrder = { ...orderedImagesets };
        updatedImagesetOrder[targetImageset][index] = file;
        setOrderedImagesets(updatedImagesetOrder);

        // update imagesetCount
        const nextImagesetCount = imagesetCounts[targetImageset] + 1;
        setImagesetCounts({
          ...imagesetCounts,
          [targetImageset]: nextImagesetCount,
        });

        const nextLoaded = loaded + 1;
        setLoaded(nextLoaded);
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

  const handleClick = async () => {};

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
        const updatedImagesetOrder = { ...orderedImagesets };
        updatedImagesetOrder[targetImageset][index] = {};
        setOrderedImagesets(updatedImagesetOrder);

        // update imagesetCount
        const nextImagesetCount = imagesetCounts[targetImageset] - 1;
        setImagesetCounts({
          ...imagesetCounts,
          [targetImageset]: nextImagesetCount,
        });

        const nextLoaded = loaded - 1;
        setLoaded(nextLoaded);
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
        <header className="flex justify-between items-center w-full py-5 px-5">
          <h2 className="xl:text-2xl tracking-tight">
            {headingText[targetImageset as keyof headingTextType]}
          </h2>

          <ul className="flex gap-5 text-xl">
            <li>
              <span className="text-rd">{imagesetCounts[targetImageset]}</span>{" "}
              FILES IN STORAGE
            </li>

            <li>
              <span className="text-rd">{loaded}</span> FILES DISPLAYED
            </li>
          </ul>

          <div className="flex items-center gap-5">
            <label className="border border-solid border-white flex items-center px-3 py-2 transition-colors xl:hover:text-rd xl:focus:text-rd xl:hover:cursor-pointer">
              {spinner ? <Loading /> : "ADD FILES"}
              <input
                type="file"
                name="additions"
                onChange={(e) => {
                  if (e.target.files) {
                    setQueuedImages([...queuedImages, ...e.target.files]);
                  }
                }}
                disabled={spinner}
                className="opacity-0 w-[1px]"
                accept="image/*"
                multiple
              />
            </label>
          </div>
        </header>

        <div className="flex flex-col items-center ">
          <div className="flex flex-wrap justify-center max-w-[60dvw] gap-5 px-5 overflow-scroll relative">
            {orderedImagesets[targetImageset].map(
              (file: File | object, index: number) => {
                return (
                  <div key={uuidv4()}>
                    {file instanceof File ? (
                      <button
                        onClick={() => handleDeleteClick(index, file.name)}
                        className="absolute bg-black m-1 border border-solid border-rd p-1"
                      >
                        <Close className={"w-4 h-4"} customColor={"#FFF"} />
                      </button>
                    ) : null}

                    <img
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

                        handleDrop(index, draggedIndex, source);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className={`${file instanceof File === false ? "h-[300px] w-[200px]" : "max-h-[300px]"} border border-solid`}
                      src={
                        file instanceof File ? URL.createObjectURL(file) : ""
                      }
                    />
                  </div>
                );
              }
            )}
          </div>

          <button
            onClick={() => handleClick()}
            type="button"
            className="border border-solid border-red px-4 py-2 xl:hover:text-rd xl:focus:text-rd transition-colors mt-8 mb-5"
          >
            LOAD NEXT BATCH
          </button>
        </div>
      </div>

      <div className="border-l-[1px] border-solid">
        <div className="grid grid-cols-3 gap-5 overflow-scroll p-3">
          {queuedImages.map((file: File, index: number) => {
            return (
              <img
                draggable={true}
                onDragStart={(e) => handleDragStart(e, file, "queue", index)}
                key={uuidv4()}
                src={file instanceof File ? URL.createObjectURL(file) : ""}
                alt=""
                className="opacity-100 max-w-[15dvh] xl:hover:cursor-pointer"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
