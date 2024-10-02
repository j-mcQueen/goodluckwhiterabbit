import { useState } from "react";
import { determineHost } from "../../global/utils/determineHost";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";

export default function Splash({ ...props }) {
  const {
    user,
    images,
    setImages,
    imagesetCounts,
    setImagesetCounts,
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

  const [fetching, setFetching] = useState(false);

  const handleClick = async () => {
    setFetching(true);
    if (Object.keys(imagesetCounts).length === 0) {
      // imagesetCounts will not be an empty object if imagesetTotals has already been calculated
      // so only run this function when the component is freshly rendered

      const host = determineHost();
      const totals = await fetch(
        `${host}/users/${user._id}/getImagesetTotals`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      setImagesetCounts(totals);
    }

    const data = await executeGenerationChain(
      [],
      activeImageset,
      setNotice,
      0,
      user._id
    );
    if (data) {
      setImages({ ...images, [activeImageset]: data.files });

      const nextActivated = { ...activated };
      nextActivated[activeImageset] = true;
      setActivated(nextActivated);
    }
  };

  // TODO if the user has files for this imageset, we render the enter button
  // TODO if the user clicks the button, set setFetching to true, and animate in a "Please wait we are fetching your files" message while animating out the button

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
