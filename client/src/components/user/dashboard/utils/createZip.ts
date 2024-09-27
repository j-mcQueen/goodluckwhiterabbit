import JSZip from "jszip";

export const createZip = async (fileset: File[]) => {
  const zip = new JSZip();

  for (let i = 0; i < fileset.length; i++) {
    zip.file(fileset[i].name, fileset[i]);
  }

  return await zip.generateAsync({ type: "base64" });
};
