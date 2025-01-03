import { memo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { handleDragStart } from "./utils/handlers/handleDragStart";
import { handleDragEnd } from "./utils/handlers/handleDragEnd";
import { handleChange } from "./utils/handlers/queueing/handleChange";
import { handleDelete } from "./utils/handlers/queueing/handleDelete";
import Close from "../../../assets/media/icons/Close";

const ImageQueue = memo(function ImageQueue() {
  const [fullRes, setFullRes] = useState<File[]>([]);
  const [queue, setQueue] = useState<File[]>([]);
  const [uploadCount, setUploadCount] = useState(0);

  return (
    <div className="border-l-[1px] border-solid">
      <div className="sticky top-0 oveflow-y-scroll">
        <div className="flex justify-between items-center gap-5 py-4 px-4">
          <p className="text-xl">
            <span className={`${queue.length > 0 ? "text-rd" : ""}`}>
              {uploadCount}
            </span>
            {uploadCount === 1 ? " FILE " : " FILES "} QUEUED
          </p>

          <label className="font-tnrBI tracking-widest opacity-80 drop-shadow-glo border border-solid flex items-center px-2 py-1 transition-colors xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer">
            ADD FILES
            <input
              type="file"
              name="additions"
              onChange={(e) =>
                handleChange(e, setUploadCount, setFullRes, setQueue)
              }
              className="opacity-0 w-[1px]"
              accept="image/*"
              multiple
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-5 overflow-scroll p-3">
          {queue.map((file: File, index: number) => {
            return (
              <div key={uuidv4()}>
                <button
                  onClick={() =>
                    handleDelete(
                      uploadCount,
                      setUploadCount,
                      queue,
                      setQueue,
                      index
                    )
                  }
                  className="absolute bg-black m-1 border border-solid border-rd p-1"
                >
                  <Close className={"w-3 h-3"} />
                </button>

                <img
                  loading="lazy"
                  draggable={true}
                  onDragStart={(e) => {
                    e.currentTarget.style.opacity = "0.25";

                    const j = fullRes.findIndex(
                      (item) =>
                        item.name === file.name.slice(2, file.name.length)
                    );
                    handleDragStart(e, file, "queue", index, fullRes[j]);
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
});
export default ImageQueue;
