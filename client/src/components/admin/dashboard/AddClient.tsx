import { FormEvent } from "react";
import { useState } from "react";
import PaneHeader from "./PaneHeader";
import Add from "../../../assets/media/icons/Add";
import Spinner from "../../../assets/media/icons/Spinner";

export default function AddClient({ ...props }) {
  interface filesType {
    sneaks: { count: number; files: FileList | null };
    full: { count: number; files: FileList | null };
    socials: { count: number; files: FileList | null };
  }

  const [selectedFiles, setSelectedFiles] = useState<filesType>({
    sneaks: { count: 0, files: null },
    full: { count: 0, files: null },
    socials: { count: 0, files: null },
  });
  const [takenEmail, setTakenEmail] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const { clients, setClients, setActivePane } = props;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSpinner(true);

    const formData = new FormData(e.currentTarget);
    formData.append(
      "sneaksAttached",
      selectedFiles.sneaks.files !== null ? "true" : "false"
    );
    formData.append(
      "fullAttached",
      selectedFiles.full.files !== null ? "true" : "false"
    );
    formData.append(
      "socialsAttached",
      selectedFiles.socials.files !== null ? "true" : "false"
    );

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
        setSpinner(false);
        setClients([...clients, data]);
        setActivePane("ALL");
      } else if (response.status === 409) {
        // Client email already in use
        setTakenEmail(true);
      }
    } catch (err) {
      // TODO handle edge cases like network errors
      console.log(err);
      return;
    }
  };

  return (
    <div className="text-white border border-solid border-white p-3 w-[40dvw]">
      <PaneHeader setActivePane={setActivePane} paneTitle={"ADD NEW CLIENT"} />

      <form
        onSubmit={(e) => handleSubmit(e)}
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
            minLength={4}
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
            onChange={() => {
              if (takenEmail) setTakenEmail(false);
            }}
            className="w-full bg-black border border-solid border-white p-3 text-ylw font-inter xl:focus:outline-none xl:focus:border-blu"
            required
          />
          {takenEmail ? (
            <p className="text-red-600 font-inter pt-3">
              Email address already in use.
            </p>
          ) : null}
        </label>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center font-inter">
            <p className="text-gray">UPLOAD SNEAK PEEKS:</p>
            <p
              className={`${selectedFiles.sneaks.count > 0 ? "text-red-600" : "text-white"}`}
            >
              {selectedFiles.sneaks.count}
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center justify-center border border-solid border-cyn drop-shadow-cyn xl:hover:border-blu xl:hover:drop-shadow-blu xl:focus:border-blu xl:focus:drop-shadow-blu cursor-pointer w-10 h-10 transition-all">
              <input
                type="file"
                name={"sneaks"}
                onChange={(e) => {
                  setSelectedFiles({
                    ...selectedFiles,
                    sneaks: {
                      count: e.target.files?.length || 0,
                      files: e.target.files,
                    },
                  });
                }}
                className="opacity-0 w-[1px]"
                accept="image/*"
                multiple
              />
              <Add className={"w-[18px] h-[18px]"} />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center font-inter">
            <p className="text-gray">UPLOAD FULL GALLERY:</p>
            <p
              className={`${selectedFiles.full.count > 0 ? "text-red-600" : "text-white"}`}
            >
              {selectedFiles.full.count}
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center justify-center border border-solid border-cyn drop-shadow-cyn xl:hover:border-blu xl:hover:drop-shadow-blu xl:focus:border-blu xl:focus:drop-shadow-blu cursor-pointer w-10 h-10 transition-all">
              <input
                type="file"
                name={"full"}
                onChange={(e) => {
                  setSelectedFiles({
                    ...selectedFiles,
                    full: {
                      count: e.target.files?.length || 0,
                      files: e.target.files,
                    },
                  });
                }}
                className="opacity-0 w-[1px]"
                accept="image/*"
                multiple
              />
              <Add className={"w-[18px] h-[18px]"} />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center font-inter">
            <p className="text-gray">UPLOAD SOCIAL MEDIA CROPS:</p>
            <p
              className={`${selectedFiles.socials.count > 0 ? "text-red-600" : "text-white"}`}
            >
              {selectedFiles.socials.count}
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center justify-center border border-solid border-cyn drop-shadow-cyn xl:hover:border-blu xl:hover:drop-shadow-blu xl:focus:border-blu xl:focus:drop-shadow-blu cursor-pointer w-10 h-10 transition-all">
              <input
                type="file"
                name={"socials"}
                onChange={(e) => {
                  setSelectedFiles({
                    ...selectedFiles,
                    socials: {
                      count: e.target.files?.length || 0,
                      files: e.target.files,
                    },
                  });
                }}
                className="opacity-0 w-[1px]"
                accept="image/*"
                multiple
              />
              <Add className={"w-[18px] h-[18px]"} />
            </label>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="border border-solid border-ylw drop-shadow-ylw xl:hover:border-grn xl:hover:drop-shadow-grn xl:focus:border-grn xl:focus:drop-shadow-grn py-3 px-5 font-inter italic bold transition-all"
          >
            {spinner ? <Spinner className="w-[18px] h-[18px]" /> : "ADD CLIENT"}
          </button>
        </div>
      </form>
    </div>
  );
}
