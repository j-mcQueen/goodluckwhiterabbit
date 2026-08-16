import { useRef, useState } from "react";
import { handleDragStart } from "./utils/handlers/handleDragStart";
import { handleDragEnd } from "./utils/handlers/handleDragEnd";
import { handleChange } from "./utils/handlers/queueing/handleChange";
import { handleDelete } from "./utils/handlers/queueing/handleDelete";

import Close from "../../../assets/media/icons/Close";

export default function ImageQueue({ ...props }) {
  const {
    queue,
    setDragTarget,
    setQueue,
    setSubmitOpen,
    compress = true,
  } = props;

  const [uploadCount, setUploadCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-l border-solid border-white w-[280px] shrink-0 flex flex-col min-h-0">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 p-3 pb-0 shrink-0">
          <p className="text-xl">
            <span className={`${uploadCount > 0 ? "text-rd" : ""}`}>
              {uploadCount}
            </span>
            {uploadCount === 1 ? " FILE " : " FILES "} QUEUED
          </p>

          <div className="flex items-center gap-2">
            {queue.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setQueue([]);
                    setUploadCount(0);
                  }}
                  className="font-tnrBI text-md tracking-widest opacity-80 flex items-center h-[36px] max-h-[36px] px-2 pt-3 pb-2 border border-solid border-white transition-colors xl:hover:text-rd xl:hover:border-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:border-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer drop-shadow-glo"
                >
                  CLEAR
                </button>

                <button
                  type="button"
                  disabled={queue.length > 0 ? false : true}
                  onClick={() => setSubmitOpen(true)}
                  className="font-tnrBI text-md tracking-widest opacity-80 flex items-center h-[36px] max-h-[36px] px-2 pt-3 pb-2 border border-solid border-white transition-colors xl:hover:text-rd xl:hover:border-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:border-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer drop-shadow-glo"
                >
                  SUBMIT
                </button>
              </>
            ) : null}

            <label className="font-tnrBI text-md tracking-widest opacity-80 drop-shadow-glo border border-solid border-white flex items-center px-2 pt-2 pb-1 transition-colors xl:hover:text-rd xl:hover:border-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:border-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer h-[36px] max-h-[36px]">
              ADD
              <input
                ref={fileRef}
                type="file"
                name="additions"
                onChange={(e) =>
                  handleChange(e, setUploadCount, setQueue, compress)
                }
                className="opacity-0 w-[1px]"
                accept="image/*"
                multiple
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0 p-3">
          {queue.map((file: File, index: number) => {
            return (
              <div key={file.name}>
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      uploadCount,
                      index,
                      queue,
                      setUploadCount,
                      setQueue,
                    )
                  }
                  className="bg-black border border-solid border-rd p-1 relative"
                >
                  <Close className={"w-3 h-3"} />
                </button>

                <img
                  loading="lazy"
                  draggable={true}
                  onDragStart={(e) => {
                    e.currentTarget.style.opacity = "0.25";
                    if (fileRef.current?.files) {
                      const file = fileRef.current.files[index];
                      setDragTarget(file);
                      handleDragStart(e, "queue", index);
                    }
                  }}
                  onDragEnd={(e) => handleDragEnd(e)}
                  src={file instanceof File ? URL.createObjectURL(file) : ""}
                  alt={file.name}
                  className="opacity-100 w-full max-w-[15dvh] xl:hover:cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
