import { Dispatch, SetStateAction } from "react";
import { convertToFile } from "../../compress/convertToFile";
import { resize } from "../../compress/resize";

export const handleChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setUploadCount: Dispatch<SetStateAction<number>>,
  setQueue: Dispatch<SetStateAction<File[]>>
) => {
  const placeholder = [];
  if (e.target.files) {
    // resize all files
    for (let i = 0; i < e.target.files.length; i++) {
      const resized = await resize(e.target.files[i], e.target.files[i].type);
      const filename = `c_${e.target.files[i].name}`;
      const converted = convertToFile(
        resized,
        filename,
        e.target.files[i].type
      );
      const newCount = placeholder.length + 1;
      setUploadCount(newCount);
      placeholder.push(converted);
    }
    setQueue([...placeholder]);
  }
  return;
};
