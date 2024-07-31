import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { convertToFile } from "./utils/convertToFile";
import Check from "../../../assets/media/icons/Check";

export default function ImageOrder({ ...props }) {
  const { targetClient, targetImageset, allOrderedImagesets, innerRef } = props;
  // https://stackoverflow.com/questions/52078853/is-it-possible-to-update-filelist
  // TODO can create hidden file inputs to attach the ordered imagesets to

  const headingText: headingTextType = {
    sneaks: "PREVIEW",
    full: "GALLERY",
    socials: "SOCIAL",
  };

  interface headingTextType {
    sneaks: string;
    full: string;
    socials: string;
  }

  const [queuedImages, setQueuedImages] = useState<
    {
      filename: string;
      url: string;
      position: number;
      queued: boolean;
      mime: string;
    }[]
  >([]);
  const [orderedImageset, setOrderedImageset] = useState<
    {
      filename: string;
      url: string;
      mime: string;
      position: number;
      file: File;
      queueIndex: number;
    }[]
  >([]);
  const [draggedIndex, setDraggedIndex] = useState(0);

  useEffect(() => {
    // retrieve images if there have been no images set in order yet
    const getImages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/admin/users/${targetClient._id}/getImages/${targetImageset}`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();

        if (data && response.status === 200) {
          const dummy = Array(data.length).fill({
            filename: "",
            url: "",
            mime: "",
            position: 0,
            queueIndex: 0,
          });
          setQueuedImages(data);
          setOrderedImageset(dummy);
        }
      } catch (err) {
        //
      }
    };

    if (allOrderedImagesets[targetImageset].length === 0) getImages();
  }, [allOrderedImagesets, targetImageset, targetClient]);

  const handleConfirmOrder = async () => {
    // create a FileList object + attach to file input
    const list = new DataTransfer();
    for (let i = 0; i < orderedImageset.length; i++) {
      if (!orderedImageset[i].file) continue;
      list.items.add(orderedImageset[i].file);
    }
    return (innerRef.current.files = list.files);
  };

  // allOrderedImagesets is only updated when the confirmation button is clicked. Clicking away with unsaved progress will open a dialog box which says "you have unsaved changes. Press proceed to continue anyway, or lock-in your changes" or something like that
  // the app will determine if the dialog box needs to show based on whether or not orderedImageset is complete (i.e. contains "empty" values) AND the confirmation button has been clicked - will need more state variables for this

  // TODO include a feature that allows GLWR to remove an image from the imageset completely? i.e. performs a delete request and sends to s3

  return (
    <div className="flex items-start">
      <div className="text-white p-3 border-r-[1px] border-solid min-w-[40vw] flex flex-col items-center justify-center overflow-scroll">
        <header className="flex justify-between items-center w-full py-5 px-5">
          <hgroup>
            <h2 className="font-inter italic font-bold xl:text-2xl tracking-tight">
              {headingText[targetImageset as keyof headingTextType]}
            </h2>
          </hgroup>

          <div className="flex gap-5">
            <button
              type="submit"
              className="border border-solid border-green-600 w-10 h-10 flex items-center justify-center"
              onClick={() => handleConfirmOrder()}
            >
              <Check className="w-[20px] h-[20px]" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-5 px-5 overflow-scroll">
          {orderedImageset.map((image, index) => {
            return (
              <img
                onDrop={(e) => {
                  // store image data in memory
                  const url = e.dataTransfer.getData("text/uri-list");
                  const filename = e.dataTransfer.getData("text/plain");
                  const mime = e.dataTransfer.getData("text/image-type");
                  const queueIndex = e.dataTransfer.getData("text/index");

                  // create a new file object from the retrieved image data
                  const newFile = convertToFile(url, filename, mime);

                  // for accessibility and image rendering, set the appropriate attributes to the data from the drag event
                  e.currentTarget.src = url;
                  e.currentTarget.alt = filename;

                  // trigger visual "removal" from image queue
                  const newQueuedImages = [...queuedImages];
                  newQueuedImages[draggedIndex].queued = false;
                  if (image.url !== "")
                    // if an image exists in the slot being dropped on, reinstate draggability of previous image
                    newQueuedImages[image.queueIndex].queued = true;
                  setQueuedImages(newQueuedImages);

                  // update image order
                  const newOrderedImages = [...orderedImageset];
                  newOrderedImages[index] = {
                    filename,
                    url,
                    mime,
                    file: newFile,
                    position: index,
                    queueIndex: Number(queueIndex),
                  };
                  setOrderedImageset(newOrderedImages);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border border-solid w-[200px] h-[300px]"
                key={uuidv4()}
                src={image.url}
                alt={image.filename}
              />
            );
          })}
        </div>
      </div>

      <div className="text-white p-3">
        <div className="grid grid-cols-imageQueue gap-5 h-[75dvh] overflow-scroll">
          {queuedImages.map(
            (
              image: {
                filename: string;
                url: string;
                mime: string;
                position: number;
                queued: boolean;
              } | null,
              index: number
            ) => {
              return (
                <img
                  onDragStart={(e) => {
                    if (image) {
                      e.dataTransfer.setData("text/uri-list", image.url);
                      e.dataTransfer.setData("text/plain", image.filename);
                      e.dataTransfer.setData("text/image-type", image.mime);
                      e.dataTransfer.setData("text/index", index.toString());
                      setDraggedIndex(index);
                    }
                  }}
                  draggable={image?.queued === true ? "true" : "false"}
                  key={uuidv4()}
                  src={image ? image.url : ""}
                  alt={image ? image.filename : ""}
                  className={
                    image?.queued === true ? "opacity-100" : "opacity-25"
                  }
                />
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
