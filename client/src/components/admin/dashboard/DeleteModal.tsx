import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { icons } from "./styles/styles";
import { determineHost as host } from "../../global/utils/determineHost";

import Close from "../../../assets/media/icons/Close";

export default function DeleteModal({ ...props }) {
  const { clients, setClients, deleteModalToggle, setDeleteModalToggle } =
    props;
  const navigate = useNavigate();

  const [serverError, setServerError] = useState({
    status: false,
    message: "",
  });

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${host}/admin/deleteUser/${deleteModalToggle.target}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();

      if ((response.status === 200 || response.status === 304) && data) {
        const updatedClients = clients.filter(
          (client: { _id: string }) => client._id !== data
        );
        setClients(updatedClients);
        setDeleteModalToggle({ active: false, target: "", name: "" });
      } else {
        switch (response.status) {
          case 401:
            // unauthorized -> indicate logout
            setServerError({
              status: true,
              message:
                "Your session has expired, so we're logging you out to keep things secure. Please login again to continue.",
            });

            return setTimeout(() => {
              // expired tokens will still be attached to browser, but logging in again will generate new ones so no logout request to server necessary
              navigate("/admin");
            }, 10000);

          case 500:
            return setServerError({ status: true, message: data.message });

          default:
            throw new TypeError("Other error.");
        }
      }
    } catch (err) {
      setServerError({
        status: true,
        message:
          "There was an unexpected error. We are logging you out to keep things secure. Please log back in and try again. If the problem persists, contact Jack.",
      });

      return setTimeout(() => {
        navigate("/admin");
      }, 10000);
    }
  };

  return (
    <dialog className="absolute flex items-center justify-center bg-black text-white border border-solid border-white p-3">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between text-lg">
          <h3 className="font-tnrBI">
            <span className="drop-shadow-glo tracking-widest opacity-80">
              DELETE CLIENT:{" "}
            </span>

            <span className="text-rd drop-shadow-red tracking-widest opacity-80 pr-3">
              {deleteModalToggle.name.toUpperCase()}
            </span>
          </h3>

          <button
            onClick={() => {
              if (serverError.status === true)
                setServerError({ status: false, message: "" });
              setDeleteModalToggle({ active: false, target: "", name: "" });
            }}
            type="button"
            className="border border-solid xl:hover:border-rd xl:focus:border-red p-2 flex items-center justify-center focus:outline-none transition-colors group"
          >
            <Close className={icons} />
          </button>
        </div>

        <p className="tracking-wider">
          ARE YOU SURE YOU WANT TO DELETE THIS CLIENT'S DATA?
        </p>

        <div>
          <button
            onClick={() => handleDelete()}
            type="button"
            className="font-tnrBI drop-shadow-glo opacity-80 border border-solid xl:hover:drop-shadow-red xl:hover:text-rd xl:focus:drop-shadow-red xl:focus:text-rd py-3 px-5 transition-colors tracking-widest w-full"
          >
            DELETE
          </button>
        </div>
      </div>

      {serverError.status === true ? (
        <div className="text-red-500 max-w-[350px] text-center text-lg">
          <p>{serverError.message.toUpperCase()}</p>
        </div>
      ) : null}
    </dialog>
  );
}
