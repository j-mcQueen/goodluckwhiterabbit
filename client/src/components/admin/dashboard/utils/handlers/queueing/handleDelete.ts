import { Dispatch, SetStateAction } from "react";

export const handleDelete = (
  count: number,
  index: number,
  fullRes: File[],
  queue: File[],
  setCount: Dispatch<SetStateAction<number>>,
  setFullRes: Dispatch<SetStateAction<File[]>>,
  setQueue: Dispatch<SetStateAction<File[]>>
) => {
  const newCount = count - 1;
  setCount(newCount);
  setQueue((prevQueue) =>
    prevQueue.filter((item) => queue.indexOf(item) !== index)
  );
  setFullRes((prevFullRes) =>
    prevFullRes.filter((item) => fullRes.indexOf(item) !== index)
  );
};
