import { useState } from "react";
import Close from "../../../assets/media/icons/Close";
import { useNavigate } from "react-router-dom";

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
        `http://localhost:3000/admin/deleteUser/${deleteModalToggle.target}`,
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
        <div className="flex items-center justify-between">
          <h3 className="italic text-gray">
            DELETE CLIENT:{" "}
            <span className="text-white">
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
            className="border border-solid border-mag drop-shadow-mag xl:hover:border-red xl:hover:drop-shadow-red xl:focus:border-red xl:focus:drop-shadow-red w-10 h-10 flex items-center justify-center outline-none transition-all"
          >
            <Close className="w-[20px] h-[20px]" customColor={"#FFF"} />
          </button>
        </div>

        <p className="font-inter">
          Are you sure you want to delete this client's data?
        </p>

        <div>
          <button
            onClick={() => handleDelete()}
            type="button"
            className="border border-solid border-red drop-shadow-red xl:hover:bg-red xl:hover:drop-shadow-none xl:focus:bg-red xl:focus:drop-shadow-none w-full py-3 font-inter transition-all"
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
