import { FormEvent } from "react";
import { useState } from "react";
import PaneHeader from "./PaneHeader";
import Add from "../../../assets/media/icons/Add";
import Spinner from "../../../assets/media/icons/Spinner";

export default function AddClient({ ...props }) {
  interface filesType {
    previews: { count: number; files: FileList | null };
    full: { count: number; files: FileList | null };
    socials: { count: number; files: FileList | null };
  }

  const [selectedFiles, setSelectedFiles] = useState<filesType>({
    previews: { count: 0, files: null },
    full: { count: 0, files: null },
    socials: { count: 0, files: null },
  });
  const [errors, setErrors] = useState({
    takenEmail: false,
    formValidation: false,
    other: false,
  });
  const [takenEmail, setTakenEmail] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const { clients, setClients, setActivePane, setRejectedFiles } = props;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSpinner(true);

    const formData = new FormData(e.currentTarget);
    formData.append(
      "previewsAttached",
      selectedFiles.previews.files !== null ? "true" : "false"
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

      if (data) {
        setSpinner(false);
        switch (response.status) {
          case 200:
            // A client has been added
            setErrors({
              takenEmail: false,
              formValidation: false, // this should always be false
              other: false,
            });
            if (data.rejected) {
              setRejectedFiles(data.rejected);
              setClients([
                ...clients,
                {
                  name: data.name,
                  code: data.code,
                  _id: data._id,
                  files: data.files,
                  added: data.added,
                },
              ]);
            } else {
              setClients([...clients, data]);
            }
            setActivePane("ALL");
            break;

          case 401:
            // form validation errors
            setErrors({ ...errors, formValidation: true });
            break;

          case 409:
            // Client email already in use
            setErrors({ ...errors, takenEmail: true });
            break;

          default:
            throw new TypeError("Error with 500 status code.");
        }
      }
    } catch (err) {
      return setErrors({ ...errors, other: true });
    }
  };

  return (
    <div className="text-white border border-solid border-white p-3 w-[40dvw]">
      <PaneHeader setActivePane={setActivePane} paneTitle={"NEW"} />

      <form
        onSubmit={(e) => handleSubmit(e)}
        method="post"
        className="flex flex-col gap-5"
        encType="multipart/form-data"
      >
        <label className="text-rd">
          CLIENT NAME
          <input
            type="text"
            name="clientname"
            placeholder="E.G. GOOD AND LUCK"
            minLength={4}
            className="w-full bg-black border border-solid border-white xl:hover:border-rd focus:border-rd p-3 focus:outline-none placeholder:text-white transition-colors"
            required
          />
        </label>

        <label className="text-rd">
          CLIENT EMAIL
          <input
            type="email"
            name="clientemail"
            placeholder="E.G. GOODLUCK@GMAIL.COM"
            onChange={() => {
              if (takenEmail) setTakenEmail(false);
            }}
            className="w-full bg-black border border-solid border-white xl:hover:border-rd focus:border-rd p-3 text-white focus:outline-none placeholder:text-white transition-colors"
            required
          />
          {errors.takenEmail ? (
            <p className="text-rd pt-3">Email address already in use.</p>
          ) : null}
        </label>

        <div className="flex items-center justify-between pt-5">
          <div className="flex gap-3 items-center">
            <p>UPLOAD PREVIEWS:</p>

            <p
              className={`${selectedFiles.previews.count > 0 ? "text-rd" : "text-white"}`}
            >
              {selectedFiles.previews.count}
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center justify-center border border-solid border-white xl:hover:border-rd focus:border-rd outline-none cursor-pointer w-10 h-10 transition-colors">
              <input
                type="file"
                name={"previews"}
                onChange={(e) => {
                  setSelectedFiles({
                    ...selectedFiles,
                    previews: {
                      count: e.target.files?.length || 0,
                      files: e.target.files,
                    },
                  });
                }}
                className="opacity-0 w-[1px]"
                accept="image/*"
                multiple
              />
              <Add className="w-4 h-4" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <p>UPLOAD FULL GALLERY:</p>
            <p
              className={`${selectedFiles.full.count > 0 ? "text-rd" : "text-white"}`}
            >
              {selectedFiles.full.count}
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center justify-center border border-solid border-white xl:hover:border-rd focus:border-rd outline-none cursor-pointer w-10 h-10 transition-colors">
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
              <Add className="w-4 h-4" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <p>UPLOAD SOCIAL MEDIA CROPS:</p>
            <p
              className={`${selectedFiles.socials.count > 0 ? "text-red-600" : "text-white"}`}
            >
              {selectedFiles.socials.count}
            </p>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center justify-center border border-solid border-white xl:hover:border-rd focus:border-rd outline-none cursor-pointer w-10 h-10 transition-colors">
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
              <Add className="w-4 h-4" />
            </label>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="font-liquid border border-solid border-red xl:hover:text-rd py-3 px-5 transition-colors tracking-widest opacity-80 drop-shadow-glo"
          >
            {spinner ? <Spinner className="w-[18px] h-[18px]" /> : "add"}
          </button>
        </div>

        {errors.formValidation || errors.other ? (
          <p>
            {errors.formValidation
              ? "There was an error in the name or email you typed in. Refresh the page and try again, then notify Jack!"
              : "Something else went wrong. Please notify Jack!"}
          </p>
        ) : null}
      </form>
    </div>
  );
}
