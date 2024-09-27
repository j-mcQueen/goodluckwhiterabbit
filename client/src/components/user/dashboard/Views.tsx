import Carousel from "./views/Carousel";
import Grid from "./views/Grid";

export default function Views({ ...props }) {
  const { images, setImages, activeImageset } = props;
  return (
    <>
      <Carousel
        images={images}
        setImages={setImages}
        activeImageset={activeImageset}
      />

      <div className="text-rd text-lg text-center py-20">
        <p>SCROLL FOR GRID &#8595;</p>
      </div>

      <Grid
        images={images}
        setImages={setImages}
        activeImageset={activeImageset}
      />
    </>
  );
}
