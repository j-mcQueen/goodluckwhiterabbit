export const handleDragStart = (
  e: React.DragEvent<HTMLDivElement>,
  // file: File,
  source: string,
  index: number
) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.clearData();
    // e.dataTransfer.items.add(file);
    // e.dataTransfer.setData("text/type", file.type);
    e.dataTransfer.setData("text/index", String(index));
    e.dataTransfer.setData("text/source", source);
  }
  return;
};
