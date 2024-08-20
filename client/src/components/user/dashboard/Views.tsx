import Carousel from "./views/Carousel";
import Grid from "./views/Grid";

export default function Views({ ...props }) {
  const { imagesets } = props;
  return (
    <>
      <Carousel imageset={imagesets} />
      <Grid imagesets={imagesets} />
    </>
  );
}
