import { FormEvent, useEffect, useRef, useState } from "react";
import Return from "../../../assets/media/icons/Return";
import ImageOrder from "./ImageOrder";

export default function EditClient({ ...props }) {
  const { targetClient, setTargetClient, setActivePane } = props;
  const previewsRef = useRef<HTMLInputElement>(null);
  const socialsRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const chooseRef = (imageset: string) => {
    switch (imageset) {
      case "previews":
        return previewsRef;

      case "socials":
        return socialsRef;

      case "gallery":
        return galleryRef;
    }
  };

  const [allOrderedImagesets, setAllOrderedImagesets] = useState({
    previews: [],
    full: [],
    socials: [],
  });

  // explicitly setting single imageset in state (rather than referencing the imageset in allOrderedImagesets) to prevent warning in the effect hook below
  const [orderedImageset, setOrderedImageset] = useState<
    {
      filename: string;
      url: string;
      mime: string;
      position: number;
      file: File;
      queueIndex: number;
    }[]
  >([]);

  const [queuedImages, setQueuedImages] = useState<
    {
      filename: string;
      url: string;
      position: number;
      queued: boolean;
      mime: string;
    }[]
  >([]);

  const [targetImageset, setTargetImageset] = useState("previews"); // this value is passed to ImageOrder component
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    // retrieve images if there have been no images set in order yet
    const getImages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/admin/users/${targetClient._id}/getImages/${targetImageset}`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();

        if (data && response.status === 200) {
          const dummy = Array(data.length).fill({
            filename: "",
            url: "",
            mime: "",
            position: 0,
            queueIndex: 0,
          });
          setQueuedImages(data);
          setOrderedImageset(dummy);
        }
      } catch (err) {
        //
      }
    };

    if (
      allOrderedImagesets[targetImageset as keyof typeof allOrderedImagesets]
        .length === 0
    )
      getImages();
  }, [allOrderedImagesets, targetImageset, targetClient._id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // target file input dynamically passed
    e.preventDefault();
    setSpinner(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `http://localhost:3000/admin/users/${targetClient._id}/editImageOrder/${targetImageset}`,
        { method: "PUT", body: formData, credentials: "include" }
      ); // server can detect, via request params, whose images and which imageset is being updated

      if (response.status === 200) {
        setAllOrderedImagesets({
          ...allOrderedImagesets,
          [targetImageset]: orderedImageset,
        });
        setSpinner(false);
      }
    } catch (err) {
      setAllOrderedImagesets({ ...allOrderedImagesets, [targetImageset]: [] });
      // TODO display a message saying that something went wrong!
    }
  };

  // TODO create button that takes Kailey to a page which allows her to "preview" what the client sees

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <div>
        <hgroup>
          <h1>{targetClient.name}</h1>
          <p>test text</p>
        </hgroup>

        <button
          type="button"
          onClick={() => {
            setTargetClient([]);
            setActivePane("ALL");
          }}
          className="bg-white w-10 h-10 flex items-center justify-center"
        >
          <Return className="w-[20px] h-[20px]" />
        </button>
      </div>

      <div>
        <div>
          <button
            type="button"
            className={`${targetImageset === "previews" ? "bg-red border border-solid border-white" : "border border-solid border-white"} font-inter font-bold border-b-0 text-center py-2 px-3`}
            onClick={() => setTargetImageset("previews")}
          >
            PREVIEW
            <label className="opacity-0 w-0">
              <input
                type="file"
                name="previews"
                className="w-0 opacity-0"
                ref={previewsRef}
              />
              {/* when we change the image order, we are updating the files object of these inputs */}
            </label>
          </button>

          <button
            type="button"
            className={`${targetImageset === "full" ? "bg-red-600 border border-solid border-white" : "border border-solid border-white"} font-inter font-bold border-b-0 text-center py-2 px-3`}
            onClick={() => setTargetImageset("full")}
          >
            GALLERY
            <label className="opacity-0 w-0">
              <input
                type="file"
                name="full"
                className="w-0 opacity-0"
                ref={galleryRef}
              />
            </label>
          </button>

          <button
            type="button"
            className={`${targetImageset === "socials" ? "bg-red-600 border border-solid border-white" : "border border-solid border-white"} font-inter font-bold border-b-0 text-center py-2 px-3`}
            onClick={() => setTargetImageset("socials")}
          >
            SOCIAL
            <label className="opacity-0 w-0">
              <input
                type="file"
                name="socials"
                className="w-0 opacity-0"
                ref={socialsRef}
              />
            </label>
          </button>
        </div>

        <div className="border border-solid border-white">
          <ImageOrder
            queuedImages={queuedImages}
            setQueuedImages={setQueuedImages}
            targetImageset={targetImageset}
            orderedImageset={orderedImageset}
            setOrderedImageset={setOrderedImageset}
            spinner={spinner}
            innerRef={chooseRef(targetImageset)}
          />
        </div>
      </div>
    </form>
  );
}
