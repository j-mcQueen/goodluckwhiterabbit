import { FormEvent, useRef, useState } from "react";
import Return from "../../../assets/media/icons/Return";
import ImageOrder from "./ImageOrder";

export default function EditClient({ ...props }) {
  const { targetClient, setTargetClient, setActivePane } = props;

  const [allOrderedImagesets, setAllOrderedImagesets] = useState({
    sneaks: [],
    full: [],
    socials: [],
  });

  const [targetImageset, setTargetImageset] = useState("sneaks"); // this value is passed to ImageOrder component
  const sneaksRef = useRef<HTMLInputElement>(null);
  const socialsRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const chooseRef = (imageset: string) => {
    switch (imageset) {
      case "sneaks":
        return sneaksRef;

      case "socials":
        return socialsRef;

      case "gallery":
        return galleryRef;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // target file input dynamically passed
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    console.log(formData);

    try {
      const response = await fetch(
        `http://localhost:3000/admin/users/${targetClient._id}/editImageOrder/${targetImageset}`,
        { method: "PUT", body: formData, credentials: "include" }
      ); // server can detect, via request params, whose images and which imageset is being updated
      const data = await response.json();

      if (response.status === 200 && data) {
        console.log(data);
        // TODO when we receive a success response from the server, make sure the response supplies the ordered imageset
        // this way we can update allOrderedImagesets with the newly ordered imageset at the correct imageset, i.e.:
        // setAllOrderedImagesets({
        //   ...allOrderedImagesets,
        //   [targetImageset]: data,
        // });
      }
    } catch (err) {
      //
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
            className={`${targetImageset === "sneaks" ? "bg-red-600 border border-solid border-white" : "border border-solid border-white"} font-inter font-bold border-b-0 text-center py-2 px-3`}
            onClick={() => setTargetImageset("sneaks")}
          >
            PREVIEW
            <label className="opacity-0 w-0">
              <input
                type="file"
                name="sneaks"
                className="w-0 opacity-0"
                ref={sneaksRef}
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
            targetClient={targetClient}
            targetImageset={targetImageset}
            allOrderedImagesets={allOrderedImagesets}
            innerRef={chooseRef(targetImageset)}
          />
        </div>
      </div>
    </form>
  );
}
