import { Dispatch, SetStateAction } from "react";

export const handleDelete = (
  count: number,
  index: number,
  queue: File[],
  setCount: Dispatch<SetStateAction<number>>,
  setQueue: Dispatch<SetStateAction<File[]>>
) => {
  const newCount = count - 1;
  setCount(newCount);
  setQueue((prevQueue) =>
    prevQueue.filter((item) => queue.indexOf(item) !== index)
  );
};
