import { FormEvent } from "react";
import { useState } from "react";
import PaneHeader from "./PaneHeader";

import Add from "../../../assets/media/icons/Add";
import Loading from "../../global/Loading";

export default function AddClient({ ...props }) {
  interface filesType {
    previews: FileList | null;
    full: FileList | null;
    socials: FileList | null;
  }

  const [inputValues, setInputValues] = useState({
    clientname: "",
    clientemail: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<filesType>({
    previews: null,
    full: null,
    socials: null,
  });
  const [errors, setErrors] = useState({
    takenEmail: { state: false, status: 200, message: "" },
    formValidation: { state: false, status: 200, message: "" },
    other: { state: false, status: 200, message: "" },
  });
  const [spinner, setSpinner] = useState(false);

  const { host, clients, setClients, setActivePane } = props;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSpinner(true);

    try {
      const response = await fetch(`${host}/admin/add`, {
        method: "POST",
        body: JSON.stringify({ ...inputValues }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data) {
        setSpinner(false);
        switch (response.status) {
          case 200:
            // A client has been added
            setErrors({
              takenEmail: { state: false, status: 200, message: "" },
              formValidation: { state: false, status: 200, message: "" }, // this should always be false
              other: { state: false, status: 200, message: "" },
            });

            setClients([
              ...clients,
              {
                name: data.name,
                code: data.code,
                _id: data._id,
                fileCounts: data.fileCounts,
                queue: {
                  previews: selectedFiles.previews,
                  full: selectedFiles.full,
                  socials: selectedFiles.socials,
                },
                added: data.added,
              },
            ]);

            setActivePane("ALL");
            break;

          case 401:
            // form validation errors
            setErrors({
              ...errors,
              formValidation: {
                state: true,
                status: data.status,
                message: data.message,
              },
            });
            break;

          case 409:
            // Client email already in use
            setErrors({
              ...errors,
              takenEmail: {
                state: true,
                status: data.status,
                message: data.message,
              },
            });
            break;

          default:
            throw new TypeError(data.message);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        return setErrors({
          ...errors,
          other: { state: true, status: 500, message: error.message },
        });
      }
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
            onChange={(e) =>
              setInputValues({ ...inputValues, clientname: e.target.value })
            }
            name="clientname"
            placeholder="E.G. GOOD AND LUCK"
            minLength={4}
            className="w-full bg-black border border-solid border-white text-white xl:hover:border-rd focus:border-rd p-3 focus:outline-none placeholder:text-white transition-colors"
            required
          />
        </label>

        <label className="text-rd">
          CLIENT EMAIL
          <input
            type="email"
            name="clientemail"
            placeholder="E.G. GOODLUCK@GMAIL.COM"
            onChange={(e) => {
              if (errors.takenEmail.state === true)
                setErrors({
                  ...errors,
                  takenEmail: { state: false, status: 200, message: "" },
                });
              setInputValues({ ...inputValues, clientemail: e.target.value });
            }}
            className="w-full bg-black border border-solid border-white text-white xl:hover:border-rd focus:border-rd p-3 focus:outline-none placeholder:text-white transition-colors"
            required
          />
          {errors.takenEmail.state === true ? (
            <p className="text-rd pt-3">{errors.takenEmail.message}</p>
          ) : null}
        </label>

        <div className="flex items-center justify-between pt-5">
          <div className="flex gap-3 items-center">
            <p>UPLOAD PREVIEWS:</p>

            <p
              className={`${selectedFiles.previews === null ? "text-white" : "text-rd"}`}
            >
              {selectedFiles.previews === null
                ? 0
                : [...selectedFiles.previews].length}
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
                    previews: e.target.files,
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
              className={`${selectedFiles.full === null ? "text-white" : "text-rd"}`}
            >
              {selectedFiles.full === null ? 0 : [...selectedFiles.full].length}
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
                    full: e.target.files,
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
              className={`${selectedFiles.socials === null ? "text-white" : "text-rd"}`}
            >
              {selectedFiles.socials === null
                ? 0
                : [...selectedFiles.socials].length}
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
                    socials: e.target.files,
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
            className="font-liquid border border-solid border-red xl:hover:text-rd py-3 px-5 transition-colors"
          >
            <span className="font-liquid tracking-widest opacity-80">
              {spinner ? <Loading /> : "add"}
            </span>
          </button>
        </div>

        {errors.formValidation.state === true || errors.other.state === true ? (
          <p>
            {errors.formValidation
              ? errors.formValidation.message
              : errors.other.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
