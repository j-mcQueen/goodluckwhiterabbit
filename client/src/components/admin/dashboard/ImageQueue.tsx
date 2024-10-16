import { memo, useState } from "react";
import { handleDragStart } from "./utils/handleDragStart";
import { v4 as uuidv4 } from "uuid";

const ImageQueue = memo(function ImageQueue() {
  const [queue, setQueue] = useState<File[]>([]);

  return (
    <div className="border-l-[1px] border-solid">
      <div className="flex justify-between items-center gap-5 py-4 px-4">
        <p className="text-xl">
          <span className={`${queue.length > 0 ? "text-rd" : ""}`}>
            {queue.length}
          </span>
          {queue.length === 1 ? " FILE " : " FILES "} QUEUED
        </p>

        <label className="border border-solid border-white flex items-center px-2 py-1 transition-colors text-xl xl:hover:text-rd xl:focus:text-rd xl:hover:cursor-pointer">
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
            <img
              loading="lazy"
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
  );
});
export default ImageQueue;
