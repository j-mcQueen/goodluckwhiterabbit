export const handleDragStart = (
  e: React.DragEvent<HTMLDivElement>,
  source: string,
  index: number
) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.clearData();
    e.dataTransfer.setData("text/index", String(index));
    e.dataTransfer.setData("text/source", source);
  }
  return;
};
