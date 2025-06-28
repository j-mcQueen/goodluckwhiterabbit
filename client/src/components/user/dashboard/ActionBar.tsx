import { handleDownload } from "./utils/handleDownload";
import Download from "../../../assets/media/icons/Download";

export default function ActionBar({ ...props }) {
  const { imageset, user, activeImage, activeImageset, carousel, setNotice } =
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
            id: user._id,
            index: imageset.indexOf(activeImage),
            imageset: activeImageset,
            setNotice,
          };
          handleDownload(args);
        }}
      >
        <Download className="w-5 h-5 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd xl:group-focus:drop-shadow-red" />
      </button>

      <p className="text-2xl">
        {numberCount(imageset.indexOf(activeImage) + 1)}{" "}
        {carousel ? ` / ${numberCount(user.fileCounts[activeImageset])}` : null}
      </p>
    </>
  );
}
