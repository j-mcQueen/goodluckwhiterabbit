import { useState } from "react";
import { icons } from "../styles/styles";
import { handleDeleteSubcategory } from "../utils/handlers/portfolio/handleDeleteSubcategory";
import { handleDeleteGroup } from "../utils/handlers/portfolio/handleDeleteGroup";

import Close from "../../../../assets/media/icons/Close";

const EMPTY_TOGGLE = {
  active: false,
  type: "",
  subId: "",
  groupId: "",
  name: "",
  estimate: "",
};

export default function PortfolioDeleteModal({ ...props }) {
  const {
    deleteModalToggle,
    setDeleteModalToggle,
    taxonomy,
    setTaxonomy,
    targetSubcategory,
    setTargetSubcategory,
    setNotice,
  } = props;

  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    setPending(true);

    const success =
      deleteModalToggle.type === "subcategory"
        ? await handleDeleteSubcategory({
            subId: deleteModalToggle.subId,
            taxonomy,
            setTaxonomy,
            setNotice,
          })
        : await handleDeleteGroup({
            subId: deleteModalToggle.subId,
            groupId: deleteModalToggle.groupId,
            targetSubcategory,
            setTargetSubcategory,
            taxonomy,
            setTaxonomy,
            setNotice,
          });

    setPending(false);
    if (success) setDeleteModalToggle(EMPTY_TOGGLE);
  };

  return (
    <dialog className="absolute flex items-center justify-center bg-black text-white border border-solid border-white p-3 z-20">
      <div className="flex flex-col gap-5 max-w-[400px]">
        <div className="flex items-center justify-between text-lg">
          <h3 className="font-tnrBI">
            <span className="drop-shadow-glo tracking-widest opacity-80">
              DELETE{" "}
              {deleteModalToggle.type === "subcategory"
                ? "SUBCATEGORY"
                : "GROUP"}
              :{" "}
            </span>

            <span className="text-rd drop-shadow-red tracking-widest opacity-80 pr-3">
              {deleteModalToggle.name.toUpperCase()}
            </span>
          </h3>

          <button
            disabled={pending}
            onClick={() => setDeleteModalToggle(EMPTY_TOGGLE)}
            type="button"
            className="border border-solid xl:hover:border-rd xl:focus:border-red p-2 flex items-center justify-center focus:outline-none transition-colors group"
          >
            <Close className={icons} />
          </button>
        </div>

        <p className="tracking-wider">
          ARE YOU SURE? THIS WILL PERMANENTLY DELETE{" "}
          {deleteModalToggle.estimate.toUpperCase()}. THIS CANNOT BE UNDONE.
        </p>

        <div>
          <button
            onClick={() => handleDelete()}
            disabled={pending}
            type="button"
            className="font-tnrBI drop-shadow-glo opacity-80 border border-solid xl:hover:drop-shadow-red xl:hover:text-rd xl:focus:drop-shadow-red xl:focus:text-rd py-3 px-5 transition-colors tracking-widest w-full"
          >
            {pending ? "DELETING..." : "DELETE"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
