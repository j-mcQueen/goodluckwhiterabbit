import { useState } from "react";

import Image from "../Image";
import Shift from "../../../../assets/media/icons/Shift";
import { determineHost } from "../../../global/utils/determineHost";

export default function Carousel({ ...props }) {
  const { userId, activeImageset, imageset, setNotice } = props;
  const [activeImage, setActiveImage] = useState(0);

  // imageset contains all the compressed files in an array
  // we can leverage the file names to make individual requests to s3 for the original files
  // once retrieved, we can then use our handy function to compress the original file to a web-friendly, higher-res value
  // fetch presigned url for getobjectcommand

  const fetchPresigned = async (
    host: string,
    index: string,
    filename: string
  ) => {
    try {
      const response = await fetch(
        `${host}/users/${userId}/${activeImageset}/${index}/${filename}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data) {
        switch (response.status) {
          case 200:
          case 304:
            return data;

          case 500:
            setNotice(data);
            break;

          default:
            throw new Error("Other");
        }
      }
    } catch (error) {
      return setNotice({
        status: true,
        message:
          "There was an error actioning your request. Please refresh the page and try again.",
        logout: { status: false, path: null },
      });
    }
  };

  const handleUpdate = async (index: string, filename: string) => {
    const host = determineHost();
    const url = await fetchPresigned(host, index, filename);
    // fetchPresigned
  };

  return (
    <section>
      <div className="flex items-center justify-between px-5">
        {activeImage > 0 ? (
          <button
            type="button"
            className="group border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors "
            onClick={() => setActiveImage(activeImage - 1)}
          >
            <Shift className="w-5 h-5 -rotate-90 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd transition-all" />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}

        <div className="relative flex flex-col basis-[80dvw] items-center overflow-hidden">
          <Image
            activeImageset={activeImageset}
            userId={userId}
            imageset={imageset}
            activeImage={imageset[activeImage]}
            carousel={true}
          />
        </div>

        {activeImage !==
        imageset.filter((item: object) => item instanceof File === true)
          .length -
          1 ? (
          <button
            type="button"
            className="group border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors "
            onClick={() => setActiveImage(activeImage + 1)}
          >
            <Shift className="w-5 h-5 rotate-90 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd transition-all" />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}
      </div>
    </section>
  );
}
