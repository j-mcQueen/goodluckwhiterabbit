import { Dispatch, SetStateAction } from "react";
import { convertToFile } from "../../compress/convertToFile";
import { resize } from "../../compress/resize";

export const handleChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setUploadCount: Dispatch<SetStateAction<number>>,
  setQueue: Dispatch<SetStateAction<File[]>>,
  // Client-side compression exists for the client-photo-delivery flow
  // (EditClient.tsx), which uploads straight to S3 via presigned PUT with
  // no server-side resize step - the client has to produce its own
  // resized copy there. The portfolio admin flow (PortfolioManager.tsx)
  // uploads through Express and does its own correct resizing via sharp
  // (2400w/768w) from a full-resolution source, so pre-shrinking to ~10%
  // width here before that just makes sharp upscale a tiny source back up,
  // producing a blurry result. Default true preserves existing behavior
  // for every caller except the ones that explicitly opt out.
  compress = true,
) => {
  const placeholder: File[] = [];
  if (e.target.files) {
    for (let i = 0; i < e.target.files.length; i++) {
      if (!compress) {
        placeholder.push(e.target.files[i]);
        setUploadCount(placeholder.length);
        continue;
      }

      const resized = await resize(
        e.target.files[i],
        e.target.files[i].type,
        0.1,
        0.5,
        0.9,
      );
      const filename = `c_${e.target.files[i].name}`;
      const converted = convertToFile(
        resized,
        filename,
        e.target.files[i].type,
      );
      const newCount = placeholder.length + 1;
      setUploadCount(newCount);
      placeholder.push(converted);
    }
    setQueue((prev) => [...prev, ...placeholder]);
  }
  return;
};
