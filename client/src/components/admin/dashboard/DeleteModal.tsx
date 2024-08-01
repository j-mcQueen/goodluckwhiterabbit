import Close from "../../../assets/media/icons/Close";

export default function DeleteModal({ ...props }) {
  const { clients, setClients, deleteModalToggle, setDeleteModalToggle } =
    props;

  const handleDelete = async () => {
    try {
      //
      const response = await fetch(
        `http://localhost:3000/admin/deleteUser/${deleteModalToggle.target}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (response.status === 200 && data) {
        const updatedClients = clients.filter(
          (client: { _id: string }) => client._id !== data
        );
        setClients(updatedClients);
        setDeleteModalToggle({ active: false, target: "", name: "" });
      }
    } catch (err) {
      //
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
            onClick={() =>
              setDeleteModalToggle({ active: false, target: "", name: "" })
            }
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
    </dialog>
  );
}
