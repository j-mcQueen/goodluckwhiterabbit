import { handleDownload } from "./utils/handleDownload";
import Download from "../../../assets/media/icons/Download";

export default function ActionBar({ ...props }) {
  const { imageset, activeImage, carousel } = props;

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
        className="border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors"
        onClick={() =>
          handleDownload(URL.createObjectURL(activeImage), activeImage.name)
        }
      >
        <Download className="w-5 h-5" />
      </button>

      {carousel ? (
        <p className="text-2xl">
          {numberCount(imageset.indexOf(activeImage) + 1)} /{" "}
          {numberCount(
            imageset.filter((item: object) => item instanceof File === true)
              .length
          )}
        </p>
      ) : null}
    </>
  );
}
