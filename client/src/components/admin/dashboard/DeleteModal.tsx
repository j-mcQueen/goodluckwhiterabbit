import { useState } from "react";
import Close from "../../../assets/media/icons/Close";
import { useNavigate } from "react-router-dom";

export default function DeleteModal({ ...props }) {
  const { host, clients, setClients, deleteModalToggle, setDeleteModalToggle } =
    props;
  const navigate = useNavigate();

  const [serverError, setServerError] = useState({
    status: false,
    message: "",
  });

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${host}/logout/admin/deleteUser/${deleteModalToggle.target}`,
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
          <h3>
            DELETE CLIENT:{" "}
            <span className="text-rd">
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
            className="border border-solid xl:hover:border-rd xl:focus:border-red w-10 h-10 flex items-center justify-center focus:outline-none transition-colors"
          >
            <Close className="w-4 h-4" customColor={"#FFF"} />
          </button>
        </div>

        <p>ARE YOU SURE YOU WANT TO DELETE ALL OF THIS CLIENT'S DATA?</p>

        <div>
          <button
            onClick={() => handleDelete()}
            type="button"
            className="font-liquid border border-solid border-red xl:hover:text-rd py-3 px-5 transition-colors tracking-widest opacity-80 drop-shadow-glo w-full"
          >
            DELETE
          </button>
        </div>
      </div>

      {serverError.status === true ? (
        <div className="text-red-500 max-w-[350px] pb-3">
          <p>{serverError.message}</p>
        </div>
      ) : null}
    </dialog>
  );
}
