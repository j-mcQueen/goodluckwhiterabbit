export const handleDragEnd = (e: React.DragEvent<HTMLImageElement>) => {
  if (e.dataTransfer.dropEffect === "none") e.currentTarget.style.opacity = "1";
  else return;
};
