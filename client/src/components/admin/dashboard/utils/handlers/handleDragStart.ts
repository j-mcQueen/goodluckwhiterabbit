export const handleDragStart = (
  e: React.DragEvent<HTMLImageElement>,
  file: File,
  source: string,
  index: number,
  fFile?: File
) => {
  if (e.dataTransfer) {
    e.dataTransfer.clearData();
    e.dataTransfer.items.add(file);
    if (fFile) e.dataTransfer.items.add(fFile); // full res file
    e.dataTransfer.setData("text/type", file.type);
    e.dataTransfer.setData("text/index", String(index));
    e.dataTransfer.setData("text/source", source);
  }
  return;
};
