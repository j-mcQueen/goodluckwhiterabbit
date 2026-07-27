import { useState } from "react";
import { handleAddGroup } from "../utils/handlers/portfolio/handleAddGroup";
import { imageset_select_btns } from "../styles/styles";
import { portfolio_group } from "../types/portfolioTypes";

import Loading from "../../../global/Loading";
import Close from "../../../../assets/media/icons/Close";

export default function GroupManager({ ...props }) {
  const {
    targetSubcategory,
    setTargetSubcategory,
    taxonomy,
    setTaxonomy,
    setDeleteModalToggle,
    onSelectGroup,
  } = props;

  const [name, setName] = useState("");
  const [error, setError] = useState({ state: false, message: "" });
  const [spinner, setSpinner] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5 text-white p-5">
      <h2 className="pb-2 tracking-widest">
        GROUPS IN <span className="text-rd">{targetSubcategory.name}</span>
      </h2>

      <div className="flex flex-wrap justify-center gap-3 max-w-[60dvw]">
        {targetSubcategory.groups.map((group: portfolio_group) => (
          <div key={group.groupId} className="relative">
            <button
              type="button"
              className={imageset_select_btns}
              onClick={() => onSelectGroup(group.groupId)}
            >
              {group.name.toUpperCase()} ({group.count})
            </button>

            <button
              type="button"
              onClick={() =>
                setDeleteModalToggle({
                  active: true,
                  type: "group",
                  subId: targetSubcategory._id,
                  groupId: group.groupId,
                  name: group.name,
                  estimate: `${group.count} image${group.count === 1 ? "" : "s"}`,
                })
              }
              className="absolute -top-2 -right-2 bg-black border border-solid border-rd p-1"
            >
              <Close className="w-3 h-3" />
            </button>
          </div>
        ))}

        {targetSubcategory.groups.length === 0 ? (
          <p className="opacity-60">NO GROUPS YET</p>
        ) : null}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const success = await handleAddGroup({
            subId: targetSubcategory._id,
            name,
            targetSubcategory,
            setTargetSubcategory,
            taxonomy,
            setTaxonomy,
            setError,
            setSpinner,
          });
          if (success) setName("");
        }}
        className="flex gap-3 items-center"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="NEW GROUP NAME"
          minLength={1}
          maxLength={100}
          className="bg-black border border-solid border-white text-white xl:hover:border-rd focus:border-rd p-2 focus:outline-none placeholder:text-white transition-colors"
          required
        />
        <button
          type="submit"
          className="border border-solid px-3 py-2 xl:hover:text-rd xl:hover:drop-shadow-red focus:text-rd focus:outline-none transition-colors"
        >
          {spinner ? <Loading /> : "ADD GROUP"}
        </button>
      </form>

      {error.state ? <p className="text-rd">{error.message}</p> : null}
    </div>
  );
}
