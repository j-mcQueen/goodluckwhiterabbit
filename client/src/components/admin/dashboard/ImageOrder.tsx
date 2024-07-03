import { v4 as uuidv4 } from "uuid";
import Check from "../../../assets/media/icons/Check";
import Return from "../../../assets/media/icons/Return";
import { useState } from "react";

export default function ImageOrder({ ...props }) {
  const { activePane, setActivePane } = props;
  // https://stackoverflow.com/questions/52078853/is-it-possible-to-update-filelist

  const dummy = Array(20).fill(0);

  interface headingTextType {
    sneaks: string;
    full: string;
    socials: string;
  }

  const headingText: headingTextType = {
    sneaks: "SNEAK PEEKS",
    full: "FULL GALLERY",
    socials: "SOCIAL MEDIA CROPS",
  };

  // TODO render image order - initially from files contained within selectedFiles.inputname.files
  // TODO any time image order is updated, create a new box for

  const [orderedImages, setOrderedImages] = useState([]); // this should be Array(files.length).fill(null) instead of []
  // essentially creates a filled array with the same length as the files from this client's imageset
  // as files are dragged and dropped, they replace the value at that index

  return (
    <div className="flex items-start gap-5">
      <div className="text-white border border-solid border-white p-3 w-[40dvw]">
        <header className="flex justify-between items-center">
          <hgroup>
            <h2 className="font-inter italic font-bold xl:text-3xl tracking-tight">
              IMAGE ORDER:{" "}
              {headingText[activePane.edit as keyof headingTextType]}
            </h2>

            <p className="xl:text-lg">
              The order in which these images will appear to your client.
            </p>
          </hgroup>

          <div className="flex gap-5">
            <button
              type="button"
              className="border border-solid border-green-600 w-10 h-10 flex items-center justify-center"
            >
              <Check className="w-[20px] h-[20px]" />
            </button>

            <button
              type="button"
              onClick={() => setActivePane({ pane: "ALL", edit: null })}
              className="bg-white w-10 h-10 flex items-center justify-center"
            >
              <Return className="w-[20px] h-[20px]" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-5 max-h-[75vh] overflow-scroll">
          {dummy.map((image, index) => {
            return (
              <div
                key={uuidv4()}
                className="border border-solid w-[200px] h-[300px]"
              >
                <img src="" alt={image} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-white border border-solid p-3 w-[40dvw] max-h-[50vw]">
        <hgroup>
          <h3 className="font-inter italic font-bold xl:text-3xl tracking-tight">
            IMAGE QUEUE
          </h3>

          <p className="xl:text-lg">
            Stage your images here, or drag them into their correct place.
          </p>
        </hgroup>

        <div className="grid grid-cols-3 gap-5 max-h-[75vh] overflow-scroll">
          {dummy.map((item) => {
            return (
              <div
                key={uuidv4()}
                className="border border-solid border-white w-[200px] h-[300px]"
              >
                <img src="" alt={item} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
