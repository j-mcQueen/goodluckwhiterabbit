import { memo, useState } from "react";
import { handleDragStart } from "./utils/handleDragStart";
import { handleDragEnd } from "./utils/handleDragEnd";
import { v4 as uuidv4 } from "uuid";
import Close from "../../../assets/media/icons/Close";

const ImageQueue = memo(function ImageQueue() {
  const [queue, setQueue] = useState<File[]>([]);

  const handleDeleteClick = (index: number) => {
    setQueue((prevQueue) =>
      prevQueue.filter((item) => queue.indexOf(item) !== index)
    );
  };

  return (
    <div className="border-l-[1px] border-solid">
      <div className="sticky top-0 oveflow-y-scroll">
        <div className="flex justify-between items-center gap-5 py-4 px-4">
          <p className="text-xl">
            <span className={`${queue.length > 0 ? "text-rd" : ""}`}>
              {queue.length}
            </span>
            {queue.length === 1 ? " FILE " : " FILES "} QUEUED
          </p>

          <label className="font-tnrBI tracking-widest opacity-80 drop-shadow-glo border border-solid flex items-center px-2 py-1 transition-colors xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer">
            ADD FILES
            <input
              type="file"
              name="additions"
              onChange={(e) => {
                if (e.target.files) {
                  setQueue([...queue, ...e.target.files]);
                }
              }}
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
                  onClick={() => handleDeleteClick(index)}
                  className="absolute bg-black m-1 border border-solid border-rd p-1"
                >
                  <Close className={"w-3 h-3"} />
                </button>

                <img
                  loading="lazy"
                  draggable={true}
                  onDragStart={(e) => {
                    e.currentTarget.style.opacity = "0.25";
                    handleDragStart(e, file, "queue", index);
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
