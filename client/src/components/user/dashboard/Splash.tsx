import { generateFileBatch } from "./utils/generateFileBatch";
import { generateImagesetGetUrls } from "./utils/generateImagesetGetUrls";

export default function Splash({ ...props }) {
  const {
    user,
    images,
    setImages,
    activated,
    setActivated,
    setNotice,
    activeImageset,
  } = props;
  const title =
    user.files[activeImageset].count > 0
      ? "excitement awaits"
      : "magic is on the way";
  const copy =
    user.files[activeImageset].count > 0
      ? `The moment you've been waiting for is here! Click the button below to view the images in the ${activeImageset} collection.`
      : "We're working hard to get these photographs ready for the grand reveal - you'll receive an email when there are updates. Thank you for your patience!";

  const handleClick = async () => {
    const urls = await generateImagesetGetUrls(activeImageset, setNotice);
    const files = await generateFileBatch(urls, 0);

    const nextImages = { ...images };
    nextImages[activeImageset] = { urls, files };
    setImages(nextImages);

    const nextActivated = { ...activated };
    nextActivated[activeImageset] = true;
    setActivated(nextActivated);
  };

  return (
    <main className="h-[calc(100dvh-1.5rem-59px)] flex items-center justify-center">
      <div className="text-white flex flex-col items-center justify-stretch">
        <h1 className="text-6xl font-liquid drop-shadow-glo tracking-widest opacity-80">
          {title}
        </h1>
        <p className="text-xl w-3/5 text-justify pt-5">{copy.toUpperCase()}</p>

        {user.files[activeImageset].count > 0 ? (
          <button
            onClick={handleClick}
            className="text-white border border-solid border-white xl:hover:border-red focus:border-red outline-none px-3 py-2 xl:transition-all"
            type="button"
          >
            ENTER
          </button>
        ) : null}
      </div>
    </main>
  );
}
