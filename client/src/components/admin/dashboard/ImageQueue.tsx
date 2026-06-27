import { useRef, useState } from "react";
import { handleDragStart } from "./utils/handlers/handleDragStart";
import { handleDragEnd } from "./utils/handlers/handleDragEnd";
import { handleChange } from "./utils/handlers/queueing/handleChange";
import { handleDelete } from "./utils/handlers/queueing/handleDelete";

import Close from "../../../assets/media/icons/Close";

export default function ImageQueue({ ...props }) {
  const { queue, setDragTarget, setQueue, setSubmitOpen } = props;

  const [uploadCount, setUploadCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-l-[1px] border-solid">
      <div>
        <div className="flex justify-between items-center gap-5 py-4 px-4">
          <p className="text-xl">
            <span className={`${uploadCount > 0 ? "text-rd" : ""}`}>
              {uploadCount}
            </span>
            {uploadCount === 1 ? " FILE " : " FILES "} QUEUED
          </p>

          {queue.length > 0 ? (
            <div
              className={`font-tnrBI text-md tracking-widest opacity-80 drop-shadow-glo border border-solid flex items-center transition-colors xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer h-[36px] max-h-[36px] ${queue.length === 0 ? "text-gray" : ""}`}
            >
              <button
                type="button"
                disabled={queue.length > 0 ? false : true}
                onClick={() => setSubmitOpen(true)}
                className="px-2 pt-3 pb-2"
              >
                SUBMIT
              </button>
            </div>
          ) : null}

          <label className="font-tnrBI text-md tracking-widest opacity-80 drop-shadow-glo border border-solid flex items-center px-2 pt-2 pb-1 transition-colors xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer h-[36px] max-h-[36px]">
            ADD FILES
            <input
              ref={fileRef}
              type="file"
              name="additions"
              onChange={(e) => handleChange(e, setUploadCount, setQueue)}
              className="opacity-0 w-[1px]"
              accept="image/*"
              multiple
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-5 overflow-scroll h-full max-h-[800px] p-3">
          {queue.map((file: File, index: number) => {
            return (
              <div key={file.name}>
                <button
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
                  className="opacity-100 max-w-[15dvh] xl:hover:cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
