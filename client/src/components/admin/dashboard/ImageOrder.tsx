import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Loading from "../../global/Loading";

export default function ImageOrder({ ...props }) {
  const {
    host,
    setNotice,
    targetClient,
    targetImageset,
    orderedImagesets,
    setOrderedImagesets,
    spinner,
    setSpinner,
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

  const [queuedImages, setQueuedImages] = useState<File[]>([
    ...targetClient.files[targetImageset].files,
  ]);
  const [loaded, setLoaded] = useState(0); // helps determine where to loop from when user wants to load more files

  const orderedImagesetsRef = useRef(orderedImagesets);
  const targetClientRef = useRef(targetClient);

  useEffect(() => {
    // only run this when ordered imagesets has no files
    const generatePresigns = async () => {
      let presigns;
      try {
        const response = await fetch(
          `${host}/admin/users/${targetClientRef.current._id}/getPresigns/${targetImageset}`,
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

        switch (response.status) {
          case 200:
          case 304:
            if (data.files === false) return data;
            presigns = data.presigns;

            if (data.skipped) {
              const filenames = data.skipped.join(" ");

              setNotice({
                status: true,
                message: `We could not receive permission to retrieve these files: ${filenames}`,
                logout: { status: false, path: null },
              });
            }
            break;

          case 500:
            setNotice(data);
            break;

          default:
            throw new Error("Other");
        }
      } catch (error) {
        setNotice({
          status: true,
          message:
            "Something went wrong. To keep things secure, we are logging you out. Please log back in and try again.",
          logout: { status: true, path: "/admin" },
        });
      }

      return presigns;
    };

    const convertUrls = async (urls: string[]) => {
      let counter = loaded;
      const nextOrderedImagesets = { ...orderedImagesetsRef.current };

      for (let i = 0; i < urls.length; i++) {
        // get the file name
        const filenameRegex = /\/([^/?]+)\?/; // match the substring between "/" and "?"
        const filename = urls[counter].match(filenameRegex);

        // convert presigned url to file
        const response = await fetch(urls[counter], { method: "GET" });
        const data = await response.blob();
        const file = new File([data], filename![1], { type: data.type });

        // get the index of file, add file to state at correct position, reflect changes in UI
        const indexRegex = /\/(\d{1,3})\//; // matches up to 3 digits between two "/"
        const index = urls[counter].match(indexRegex);
        nextOrderedImagesets[targetImageset].files[index![1]] = file;

        counter++;

        if (i === 9 || i === urls.length - 1) {
          const nextLoaded = counter;
          setLoaded(nextLoaded);
          break;
        }
      }
      return nextOrderedImagesets;
    };

    const renderImages = async () => {
      setSpinner(true);
      const urls = await generatePresigns();
      if (urls.files === false) {
        setSpinner(false);
        setNotice({
          status: true,
          message: "There were no files found in S3.",
          logout: { status: false, path: null },
        });
        return;
      }

      const nextOrderedImagesets = await convertUrls(urls);
      setOrderedImagesets(nextOrderedImagesets);
      setSpinner(false);
    };

    const containsFiles = orderedImagesetsRef.current[
      targetImageset
    ].files.some((item: File | object) => item instanceof File);

    if (containsFiles === false) renderImages();
  }, [
    host,
    targetImageset,
    loaded,
    setSpinner,
    setNotice,
    setOrderedImagesets,
  ]);

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

    // generate presigned URL for file upload
    const file =
      source === "queue"
        ? queuedImages[draggedIndex]
        : orderedImagesets[targetImageset].files[draggedIndex];
    let presigned = "";
    try {
      // does where we are dragging into (index) have a file in place already?
      // if so, then we need to supply the fetch body with the filename of the delete target
      // then in the response, we should have an array of urls, the first being the delete target, the second being the new file for that index
      // delete first, then upload
      const response = await fetch(`${host}/generateUrl`, {
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
            logout: { status: false, path: "" },
          });
        }
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
        updatedImagesetOrder[targetImageset].files[index] = file;
        setOrderedImagesets(updatedImagesetOrder);
      } else {
        throw new Error("Other");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        setNotice({
          status: true,
          message: "We could not upload your image. Please try again.",
          logout: { status: false, path: "" },
        });
      }
    }
  };

  // TODO include a feature that allows GLWR to remove an image from the imageset completely? i.e. performs a delete request and sends to s3

  return (
    <div className="flex items-start">
      <div className="text-white p-3 min-w-[40vw] flex flex-col items-center justify-center overflow-scroll">
        <header className="flex justify-between items-center w-full py-5 px-5">
          <h2 className="xl:text-2xl tracking-tight">
            {headingText[targetImageset as keyof headingTextType]}
          </h2>

          <div className="flex items-center gap-5">
            {spinner ? <Loading /> : null}

            <label className="font-liquid tracking-widest opacity-80 border border-solid border-white flex items-center px-3 py-2 transition-colors xl:hover:text-rd xl:focus:text-rd xl:hover:cursor-pointer">
              add
              <input
                type="file"
                name="additions"
                onChange={(e) => {
                  if (e.target.files) {
                    setQueuedImages([...queuedImages, ...e.target.files]);
                  }
                }}
                className="opacity-0 w-[1px]"
                accept="image/*"
                multiple
              />
            </label>
          </div>
        </header>

        <div className="flex flex-col items-center ">
          <div className="flex flex-wrap justify-center max-w-[60dvw] gap-5 px-5 overflow-scroll">
            {orderedImagesets[targetImageset].files.map(
              (file: File | object, index: number) => {
                return (
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
                    key={uuidv4()}
                    src={file instanceof File ? URL.createObjectURL(file) : ""}
                  />
                );
              }
            )}
          </div>

          {orderedImagesets[targetImageset].count <
          targetClient.files[targetImageset].count ? (
            <button
              type="button"
              className="border border-solid border-red px-4 py-2 xl:hover:text-rd xl:focus:text-rd transition-colors"
            >
              LOAD MORE
            </button>
          ) : null}
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
