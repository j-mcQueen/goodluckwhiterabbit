import { Dispatch, SetStateAction } from "react";

export const handleDelete = (
  count: number,
  setCount: Dispatch<SetStateAction<number>>,
  queue: File[],
  setQueue: Dispatch<SetStateAction<File[]>>,
  index: number
) => {
  const newCount = count - 1;
  setCount(newCount);
  setQueue((prevQueue) =>
    prevQueue.filter((item) => queue.indexOf(item) !== index)
  );
};
