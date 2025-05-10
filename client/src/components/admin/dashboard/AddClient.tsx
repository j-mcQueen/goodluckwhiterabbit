import { FormEvent } from "react";
import { useState } from "react";
import { determineHost } from "../../global/utils/determineHost";

import PaneHeader from "./PaneHeader";
import Loading from "../../global/Loading";

export default function AddClient({ ...props }) {
  const [inputValues, setInputValues] = useState({
    clientname: "",
    clientemail: "",
  });
  const [errors, setErrors] = useState({
    takenEmail: { state: false, status: 200, message: "" },
    formValidation: { state: false, status: 200, message: "" },
    other: { state: false, status: 200, message: "" },
  });
  const [spinner, setSpinner] = useState(false);

  const { clients, setClients, setActivePane } = props;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSpinner(true);
    const host = determineHost;

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
