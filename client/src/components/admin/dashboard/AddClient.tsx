import { useState } from "react";
import { handleAdd } from "./utils/handlers/adding/handleAdd";
import { handleAddTypes } from "./types/handleAddTypes";

import PaneHeader from "./PaneHeader";
import Loading from "../../global/Loading";

export default function AddClient({ ...props }) {
  const { clients, setClients, setActivePane } = props;

  const checkbox_styles =
    "h-4 w-4 border border-solid border-white peer-checked:bg-white absolute left-0 -translate-x-7";

  const [inputValues, setInputValues] = useState({
    clientname: "",
    clientemail: "",
    clientcategory: "",
    clientsets: {
      snaps: false,
      keepsake: false,
      core: false,
      socials: false,
    },
  });

  const [errors, setErrors] = useState({
    takenEmail: { state: false, status: 200, message: "" },
    formValidation: { state: false, status: 200, message: "" },
    other: { state: false, status: 200, message: "" },
  });

  const [spinner, setSpinner] = useState(false);

  return (
    <div className="text-white border border-solid border-white p-3 w-[40dvw]">
      <PaneHeader setActivePane={setActivePane} paneTitle={"NEW"} />

      <form
        onSubmit={(e) => {
          const args: handleAddTypes = {
            clients,
            e,
            errors,
            inputValues,
            setActivePane,
            setClients,
            setErrors,
            setSpinner,
          };

          handleAdd(args);
        }}
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
            className="w-full mt-1 bg-black border border-solid border-white text-white xl:hover:border-rd focus:border-rd p-3 focus:outline-none placeholder:text-white transition-colors"
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
            className="w-full mt-1 bg-black border border-solid border-white text-white xl:hover:border-rd focus:border-rd p-3 focus:outline-none placeholder:text-white transition-colors"
            required
          />
          {errors.takenEmail.state === true ? (
            <p className="text-rd pt-3">{errors.takenEmail.message}</p>
          ) : null}
        </label>

        <label className="text-rd">
          CATEGORY
          <input
            type="text"
            name="category"
            placeholder="E.G. MILK WEED"
            onChange={(e) => {
              setInputValues({
                ...inputValues,
                clientcategory: e.target.value,
              });
            }}
            className="w-full mt-1 bg-black border border-solid border-white text-white xl:hover:border-rd focus:border-rd p-3 focus:outline-none placeholder:text-white transition-colors"
            required
          />
        </label>

        <fieldset>
          <legend className="text-rd pb-2">IMAGESETS</legend>

          <div className="flex justify-evenly gap-10">
            <label className="flex xl:hover:cursor-pointer relative">
              SNAPSHOTS
              <input
                type="checkbox"
                name="snapshots"
                className="invisible peer"
                onChange={() => {
                  if (errors.formValidation.state === true)
                    setErrors({
                      ...errors,
                      formValidation: {
                        state: false,
                        status: 200,
                        message: "",
                      },
                    });

                  setInputValues({
                    ...inputValues,
                    clientsets: {
                      ...inputValues.clientsets,
                      snaps: !inputValues.clientsets.snaps,
                    },
                  });
                }}
              />
              <span className={checkbox_styles}></span>
            </label>

            <label className="flex xl:hover:cursor-pointer relative">
              KEEPSAKE
              <input
                type="checkbox"
                name="keepsake"
                className="invisible peer"
                onChange={() => {
                  if (errors.formValidation.state === true)
                    setErrors({
                      ...errors,
                      formValidation: {
                        state: false,
                        status: 200,
                        message: "",
                      },
                    });

                  setInputValues({
                    ...inputValues,
                    clientsets: {
                      ...inputValues.clientsets,
                      keepsake: !inputValues.clientsets.keepsake,
                    },
                  });
                }}
              />
              <span className={checkbox_styles}></span>
            </label>

            <label className="flex xl:hover:cursor-pointer relative">
              CORE
              <input
                type="checkbox"
                name="core"
                className="invisible peer"
                onChange={() => {
                  if (errors.formValidation.state === true)
                    setErrors({
                      ...errors,
                      formValidation: {
                        state: false,
                        status: 200,
                        message: "",
                      },
                    });

                  setInputValues({
                    ...inputValues,
                    clientsets: {
                      ...inputValues.clientsets,
                      core: !inputValues.clientsets.core,
                    },
                  });
                }}
              />
              <span className={checkbox_styles}></span>
            </label>

            <label className="flex xl:hover:cursor-pointer relative">
              SOCIALS
              <input
                type="checkbox"
                name="socials"
                className="invisible peer"
                onChange={() => {
                  if (errors.formValidation.state === true)
                    setErrors({
                      ...errors,
                      formValidation: {
                        state: false,
                        status: 200,
                        message: "",
                      },
                    });

                  setInputValues({
                    ...inputValues,
                    clientsets: {
                      ...inputValues.clientsets,
                      socials: !inputValues.clientsets.socials,
                    },
                  });
                }}
              />
              <span className={checkbox_styles}></span>
            </label>
          </div>
        </fieldset>

        <div className="text-center">
          <button
            type="submit"
            className="border border-solid xl:hover:text-rd drop-shadow-glo xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red py-3 px-5 transition-colors group"
          >
            <span className="font-tnrBI tracking-widest opacity-80">
              {spinner ? <Loading /> : "ADD"}
            </span>
          </button>
        </div>

        {errors.formValidation.state === true || errors.other.state === true ? (
          <p className="text-rd">
            {errors.formValidation
              ? errors.formValidation.message
              : errors.other.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
