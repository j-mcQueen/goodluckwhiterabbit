import { v4 as uuidv4 } from "uuid";
import { Fragment } from "react/jsx-runtime";

import Image from "../Image";

export default function Grid({ ...props }) {
  const { imageset, fileCounts, disabled, handleClick, spinner } = props;

  return (
    <section className="flex flex-col justify-center basis-[80dvw] pb-10">
      <div className="flex flex-wrap justify-center gap-x-24 gap-y-12 relative overflow-hidden px-10">
        {imageset
          .filter((image: object) => image instanceof File === true)
          .map((image: object) => {
            return (
              <Fragment key={uuidv4()}>
                <Image
                  activeImage={image}
                  imageset={imageset}
                  carousel={false}
                />
              </Fragment>
            );
          })}
      </div>

      {fileCounts !==
        imageset.filter((item: object) => item instanceof File === true)
          .length && !spinner ? (
        <div className="text-rd text-lg text-center pb-20 pt-10">
          <p>TO DOWNLOAD ALL</p>
          <p>&#8595;</p>
          <button
            type="button"
            disabled={disabled}
            className="font-tnrBI tracking-widest opacity-80 drop-shadow-glo border border-solid border-white text-sm text-white pt-2 pb-1 px-3 xl:hover:border-rd xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:focus:text-rd xl:focus:border-rd transition-colors mt-2"
            onClick={handleClick}
          >
            SEE MORE
          </button>
        </div>
      ) : null}
    </section>
  );
}
