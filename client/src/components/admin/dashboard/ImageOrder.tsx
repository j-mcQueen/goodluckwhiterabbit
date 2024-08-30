import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { convertToFile } from "./utils/convertToFile";

import Loading from "../../global/Loading";

export default function ImageOrder({ ...props }) {
  const {
    setQueuedImages,
    queuedImages,
    targetImageset,
    orderedImageset,
    setOrderedImageset,
    spinner,
    innerRef,
  } = props;
  // https://stackoverflow.com/questions/52078853/is-it-possible-to-update-filelist
  // TODO can create hidden file inputs to attach the ordered imagesets to

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

  const [draggedIndex, setDraggedIndex] = useState(0);

  const attachFiles = async () => {
    // create a FileList object + attach to file input
    const list = new DataTransfer();
    for (let i = 0; i < orderedImageset.length; i++) {
      if (!orderedImageset[i].file) continue;
      list.items.add(orderedImageset[i].file);
    }
    return (innerRef.current.files = list.files);
  };

  // TODO include a feature that allows GLWR to remove an image from the imageset completely? i.e. performs a delete request and sends to s3
  // TODO warn K of lost progress if check button is not clicked

  return (
    <div className="flex items-start">
      <div className="text-white p-3 border-r-[1px] border-solid min-w-[40vw] flex flex-col items-center justify-center overflow-scroll">
        <header className="flex justify-between items-center w-full py-5 px-5">
          <h2 className="xl:text-2xl tracking-tight">
            {headingText[targetImageset as keyof headingTextType]}
          </h2>

          <div className="flex gap-5">
            <button
              type="submit"
              className="border border-solid border-rd xl:hover:text-rd xl:hover:border-red focus:border-red focus:text-rd  outline-none transition-all flex items-center justify-center px-3 py-2"
              onClick={() => attachFiles()}
            >
              <span className="font-liquid tracking-widest opacity-80">
                {spinner ? <Loading /> : "confirm"}
              </span>
            </button>
          </div>
        </header>

        <div className="flex flex-wrap justify-center max-w-[60dvw] gap-5 px-5 overflow-scroll">
          {orderedImageset.map(
            (
              image: {
                filename: string;
                url: string;
                mime: string;
                position: number;
                file: File;
                queueIndex: number;
              },
              index: number
            ) => {
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
                  className={`${image.url === "" ? "h-[300px] w-[200px]" : "max-h-[300px]"} border border-solid`}
                  key={uuidv4()}
                  src={image.url}
                  alt={image.filename}
                />
              );
            }
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 overflow-scroll p-3">
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
                className={`${
                  image?.queued === true ? "opacity-100" : "opacity-25"
                } max-w-[15dvh] xl:hover:cursor-pointer`}
              />
            );
          }
        )}
      </div>
    </div>
  );
}
