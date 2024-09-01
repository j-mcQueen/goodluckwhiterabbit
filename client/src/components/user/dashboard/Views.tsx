import Carousel from "./views/Carousel";
import Grid from "./views/Grid";

export default function Views({ ...props }) {
  const { imagesets, activeImageset, favourites, setFavourites } = props;
  return (
    <>
      <Carousel
        imagesets={imagesets}
        activeImageset={activeImageset}
        favourites={favourites}
        setFavourites={setFavourites}
      />

      <div className="text-rd text-lg text-center py-20">
        <p>SCROLL FOR GRID &#8595;</p>
      </div>

      <Grid
        imagesets={imagesets}
        activeImageset={activeImageset}
        favourites={favourites}
        setFavourites={setFavourites}
      />
    </>
  );
}
