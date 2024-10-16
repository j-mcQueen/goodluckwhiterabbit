export const handleDragStart = (
  e: React.DragEvent<HTMLImageElement>,
  file: File,
  source: string,
  index: number
) => {
  if (e.dataTransfer) {
    e.dataTransfer.clearData();
    e.dataTransfer.items.add(file);
    // e.dataTransfer.setData("text/uri", URL.createObjectURL(file));
    // e.dataTransfer.setData("text/plain", URL.createObjectURL(file));
    e.dataTransfer.setData("text/index", String(index));
    e.dataTransfer.setData("text/source", source);
  }
  return;
};
