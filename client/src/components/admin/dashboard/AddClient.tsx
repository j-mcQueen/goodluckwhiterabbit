import { FormEvent } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PaneHeader from "./PaneHeader";

export default function AddClient({ ...props }) {
  // TODO configure this component to allow for client editing (since the form is largely the same)
  const [selectedFiles, setSelectedFiles] = useState({
    sneaks: 0,
    full: 0,
    socials: 0,
  });

  const { clients, setActivePane, setClients } = props;

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
              onChange={(e) =>
                setSelectedFiles({
                  ...selectedFiles,
                  [inputName]: e.target.files?.length || 0,
                })
              }
              className="opacity-0 w-[1px]"
              accept="image/*"
              multiple
            />
            BROWSE
          </label>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("http://localhost:3000/admin/add", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      // TODO handle server form validation errors

      if (response.status === 200 && data) {
        // A client has been added
        // update state on admin dashboard component to include the addition of a new client
        // TODO set activePane back to "ALL"
        setClients({ ...clients, [data.name]: data });
        setActivePane("ALL");
      }
    } catch (err) {
      console.log(err);
      return;
    }
  };

  return (
    <div>
      <PaneHeader setActivePane={setActivePane} paneTitle={"ADD NEW CLIENT"} />

      <form
        onSubmit={(e) => handleSubmit(e)}
        action=""
        method="post"
        className="flex flex-col gap-5"
        encType="multipart/form-data"
      >
        <label>
          CLIENT NAME
          <input
            type="text"
            name="clientname"
            placeholder="e.g. Good and Luck"
            className="w-full bg-black border border-solid border-white p-3 text-ylw font-inter xl:focus:outline-none xl:focus:border-blu"
            required
          />
        </label>

        <label>
          CLIENT EMAIL
          <input
            type="email"
            name="clientemail"
            placeholder="e.g. goodluck@gmail.com"
            className="w-full bg-black border border-solid border-white p-3 text-ylw font-inter xl:focus:outline-none xl:focus:border-blu"
            required
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
