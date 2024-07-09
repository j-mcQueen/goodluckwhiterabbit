import { useState } from "react";
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

  // TODO create button that takes Kailey to a page which allows her to "preview" what the client sees

  return (
    <form>
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
              <input type="file" name="" className="w-0 opacity-0" />
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
              <input type="file" name="" className="w-0 opacity-0" />
            </label>
          </button>

          <button
            type="button"
            className={`${targetImageset === "socials" ? "bg-red-600 border border-solid border-white" : "border border-solid border-white"} font-inter font-bold border-b-0 text-center py-2 px-3`}
            onClick={() => setTargetImageset("socials")}
          >
            SOCIAL
            <label className="opacity-0 w-0">
              <input type="file" name="" className="w-0 opacity-0" />
            </label>
          </button>
        </div>

        <div className="border border-solid border-white">
          <ImageOrder
            targetClient={targetClient}
            targetImageset={targetImageset}
            allOrderedImagesets={allOrderedImagesets}
            setAllOrderedImagesets={setAllOrderedImagesets}
          />
        </div>
      </div>
    </form>
  );
}
