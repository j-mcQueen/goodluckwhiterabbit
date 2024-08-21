import { v4 as uuidv4 } from "uuid";
import { Fragment } from "react/jsx-runtime";
import Image from "../Image";

export default function Grid({ ...props }) {
  const { imagesets, activeImageset, favourites, setFavourites } = props;

  return (
    <section className="flex justify-center basis-[80dvw] pb-10">
      <div className="grid grid-cols-2 gap-10 relative overflow-hidden px-10">
        {imagesets[activeImageset].map((image: object) => {
          return (
            <Fragment key={uuidv4()}>
              <Image
                activeImage={image}
                favourites={favourites}
                setFavourites={setFavourites}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
