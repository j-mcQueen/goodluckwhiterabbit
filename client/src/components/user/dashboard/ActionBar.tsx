import { handleDownload } from "./utils/handleDownload";
import Download from "../../../assets/media/icons/Download";

export default function ActionBar({ ...props }) {
  const { imageset, fileCount, userId, activeImage, activeImageset, carousel } =
    props;

  const numberCount = (n: number) => {
    if (n >= 0 && n < 100) {
      return String(n).padStart(3, "0");
    } else if (n >= 100) {
      return n;
    }
  };

  return (
    <>
      <button
        type="button"
        className="border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors group"
        onClick={() => {
          const args = {
            id: userId,
            index: imageset.indexOf(activeImage),
            imageset: activeImageset,
            filename: activeImage.name,
            type: activeImage.type,
          };
          handleDownload(args);
        }}
      >
        <Download className="w-5 h-5 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd xl:group-focus:drop-shadow-red" />
      </button>

      <p className="text-2xl">
        {numberCount(imageset.indexOf(activeImage) + 1)}{" "}
        {carousel ? ` / ${numberCount(fileCount)}` : null}
      </p>
    </>
  );
}
