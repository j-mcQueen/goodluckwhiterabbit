import JSZip from "jszip";
import { saveAs } from "file-saver";

export const createZip = async (fileset: File[], zipName: string) => {
  const zip = new JSZip();

  for (let i = 0; i < fileset.length; i++) {
    zip.file(fileset[i].name, fileset[i]);
  }

  return await zip
    .generateAsync({ type: "blob" })
    .then((blob) => saveAs(blob, zipName));
};
