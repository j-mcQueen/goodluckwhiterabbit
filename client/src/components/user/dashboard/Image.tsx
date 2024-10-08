import ActionBar from "./ActionBar";

export default function Image({ ...props }) {
  const { activeImage, setFavourites, favourites, carousel } = props;

  return (
    <div className="relative">
      <img
        src={URL.createObjectURL(activeImage)}
        alt={activeImage.name}
        className="h-[80dvh]"
      />

      {!carousel ? (
        <div className="text-white flex justify-between py-2">
          <ActionBar
            favourites={favourites}
            setFavourites={setFavourites}
            activeImage={activeImage}
            carousel={carousel}
          />
        </div>
      ) : null}
    </div>
  );
}
