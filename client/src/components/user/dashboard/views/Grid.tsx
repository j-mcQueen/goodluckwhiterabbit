import { v4 as uuidv4 } from "uuid";
import { Fragment } from "react/jsx-runtime";

import Image from "../Image";

export default function Grid({ ...props }) {
  const { favourites, setFavourites, imageset } = props;

  return (
    <section className="flex justify-center basis-[80dvw] pb-10">
      <div className="flex flex-wrap justify-center gap-x-24 gap-y-12 relative overflow-hidden px-10">
        {imageset.map((image: object) => {
          return (
            <Fragment key={uuidv4()}>
              <Image
                activeImage={image}
                favourites={favourites}
                setFavourites={setFavourites}
                carousel={false}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
