// import { FormEvent } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PaneHeader from "./PaneHeader";

export default function AddClient({ ...props }) {
  // TODO configure this component to allow for client editing (since the form is largely the same)
  const { setActivePane } = props;
  const [selectedFiles, setSelectedFiles] = useState({
    sneaks: 0,
    full: 0,
    socials: 0,
  });

  // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {};

  // TODO create state which holds an object that contains how many files have been selected for sneak peeks, full gallery, socials
  // TODO create an array of objects which holds data for each browse component

  const photoCategoryData = [
    {
      title: "UPLOAD SNEAK PEEKS",
      fileCount: selectedFiles.sneaks,
      labelFor: "sneaks",
      inputName: "sneaks",
      inputId: "sneaks",
    },
    {
      title: "UPLOAD FULL GALLERY",
      fileCount: selectedFiles.full,
      labelFor: "full",
      inputName: "full",
      inputId: "full",
    },
    {
      title: "UPLOAD SOCIAL MEDIA CROPS",
      fileCount: selectedFiles.socials,
      labelFor: "socials",
      inputName: "socials",
      inputId: "socials",
    },
  ];

  const Browse = ({ ...props }) => {
    const { title, fileCount, labelFor, inputName, inputId } = props;

    // TODO 2nd p tag text should either be 0 files selected, x files selected, or 1 file selected, each object contains how many files have been selected
    return (
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center font-inter">
          <p className="text-gray">{title}:</p>
          <p className={`${fileCount > 0 ? "text-red-600" : "text-white"}`}>
            {fileCount === 0
              ? "No files selected."
              : fileCount === 1
                ? "1 file selected."
                : `${fileCount} files selected.`}
          </p>
        </div>

        <div>
          <label
            htmlFor={labelFor}
            className="cursor-pointer bg-white text-black py-2 px-3 font-inter italic font-bold focus-within:bg-blu focus-within:text-white xl:hover:bg-blu xl:hover:text-white transition-colors"
          >
            <input
              type="file"
              name={inputName}
              id={inputId}
              multiple
              onChange={(e) =>
                setSelectedFiles({
                  ...selectedFiles,
                  [inputName]: e.target.files?.length || 0,
                })
              }
              className="opacity-0 w-[1px]"
            />
            BROWSE
          </label>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PaneHeader setActivePane={setActivePane} paneTitle={"ADD NEW CLIENT"} />

      <form
        // onSubmit={(e) => handleSubmit(e)}
        action=""
        method="post"
        className="flex flex-col gap-5"
        encType="multipart/form-data"
      >
        <label>
          CLIENT NAME
          <input
            type="text"
            placeholder="e.g. Good and Luck"
            className="w-full bg-black border border-solid border-white p-3 text-ylw font-inter xl:focus:outline-none xl:focus:border-blu"
          />
        </label>

        <label>
          CLIENT EMAIL
          <input
            type="email"
            name=""
            placeholder="e.g. goodluck@gmail.com"
            className="w-full bg-black border border-solid border-white p-3 text-ylw font-inter xl:focus:outline-none xl:focus:border-blu"
          />
        </label>

        {photoCategoryData.map((category) => {
          return (
            <Browse
              key={uuidv4()}
              title={category.title}
              fileCount={category.fileCount}
              labelFor={category.labelFor}
              inputName={category.inputName}
              inputId={category.inputId}
            />
          );
        })}

        <div className="text-center">
          <button
            type="submit"
            className="border border-solid border-green-600 py-3 px-5 font-inter italic bold xl:hover:bg-green-600 transition-colors"
          >
            ADD CLIENT
          </button>
        </div>
      </form>
    </div>
  );
}
