import { v4 as uuidv4 } from "uuid";
import Check from "../../../assets/media/icons/Check";
import { useEffect, useState } from "react";

export default function ImageOrder({ ...props }) {
  const {
    targetClient,
    targetImageset,
    allOrderedImagesets,
    setAllOrderedImagesets,
  } = props;
  // https://stackoverflow.com/questions/52078853/is-it-possible-to-update-filelist
  // TODO can create hidden file inputs to attach the ordered imagesets to

  const [orderedImageset, setOrderedImageset] = useState([]);
  const [queuedImages, setQueuedImages] = useState([]);

  const dummy = Array(20).fill(0);

  interface headingTextType {
    sneaks: string;
    full: string;
    socials: string;
  }

  const headingText: headingTextType = {
    sneaks: "PREVIEW",
    full: "GALLERY",
    socials: "SOCIAL",
  };

  useEffect(() => {
    // TODO when the component loads, we need to target the end-point on the server that will retrieve the imageset from s3
    // TODO create target endpoint on server
    // TODO if imageQueue is empty for image set, run getImages() to send a request to the server to fetch them

    const getImages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/admin/users/${targetClient._id}/getImages/${targetImageset}`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();

        if (data && response.status === 200) {
          setQueuedImages(data);
        }
      } catch (err) {
        //
      }
    };

    if (allOrderedImagesets[targetImageset].length === 0) getImages();
  }, [allOrderedImagesets, targetImageset, targetClient]);

  // TODO render image order - initially from files contained within selectedFiles.inputname.files
  // allOrderedImagesets is only updated when the confirmation button is clicked. Clicking away with unsaved progress will open a dialog box which says "you have unsaved changes. Press proceed to continue anyway, or lock-in your changes" or something like that
  // the app will determine if the dialog box needs to show based on whether or not orderedImageset is complete (i.e. contains "empty" values) AND the confirmation button has been clicked - will need more state variables for this
  return (
    <div className="flex items-start">
      <div className="text-white p-3 border-r-[1px] border-solid min-w-[40vw] flex flex-col items-center justify-center">
        <header className="flex justify-between items-center w-full py-5 px-5">
          <hgroup>
            <h2 className="font-inter italic font-bold xl:text-2xl tracking-tight">
              {headingText[targetImageset as keyof headingTextType]}
            </h2>
          </hgroup>

          <div className="flex gap-5">
            <button
              type="button"
              className="border border-solid border-green-600 w-10 h-10 flex items-center justify-center"
            >
              <Check className="w-[20px] h-[20px]" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 items-center justify-center gap-10 max-h-[75vh] overflow-scroll px-5">
          {dummy.map((image, index) => {
            return (
              <div
                key={uuidv4()}
                className="border border-solid w-[200px] h-[300px]"
              >
                <img src={queuedImages[0]} alt={image} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-white p-3">
        <div className="grid grid-cols-3 gap-5 max-h-[75vh] overflow-scroll">
          {dummy.map((item) => {
            return (
              <div
                key={uuidv4()}
                className="border border-solid border-white w-[100px] h-[150px]"
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
