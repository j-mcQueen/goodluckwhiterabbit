import { useState } from "react";
import { handleAddGroup } from "../utils/handlers/portfolio/handleAddGroup";
import { handleMovePortfolioGroup } from "../utils/handlers/portfolio/handleMovePortfolioGroup";
import { imageset_select_btns } from "../styles/styles";
import { portfolio_group } from "../types/portfolioTypes";

import Loading from "../../../global/Loading";
import Close from "../../../../assets/media/icons/Close";
import DragHandle from "../../../../assets/media/icons/DragHandle";

export default function GroupManager({ ...props }) {
  const {
    targetSubcategory,
    setTargetSubcategory,
    taxonomy,
    setTaxonomy,
    setDeleteModalToggle,
    setNotice,
    onSelectGroup,
  } = props;

  const [name, setName] = useState("");
  const [error, setError] = useState({ state: false, message: "" });
  const [spinner, setSpinner] = useState(false);
  const [dragGroupId, setDragGroupId] = useState<string | null>(null);
  // which gap (0..sortedGroups.length) the drag is currently over, so the
  // row bordering that gap can be highlighted as the landing position
  const [hoverGap, setHoverGap] = useState<number | null>(null);

  // `order` is the only field that governs display sequence - never assume
  // targetSubcategory.groups is already sorted (a freshly-added group is
  // appended locally by handleAddGroup, but the backend prepends it via a
  // lower `order` value)
  const sortedGroups = [...targetSubcategory.groups].sort(
    (a: portfolio_group, b: portfolio_group) => a.order - b.order,
  );

  const applyGroups = (groups: portfolio_group[]) => {
    const updatedSubcategory = { ...targetSubcategory, groups };
    setTargetSubcategory(updatedSubcategory);
    setTaxonomy(
      taxonomy.map((sub: { _id: string }) =>
        sub._id === targetSubcategory._id ? updatedSubcategory : sub,
      ),
    );
  };

  // `to` is a gap index (0..sortedGroups.length), matching the mechanic
  // adminMovePortfolioLayoutItem already uses one level down for images/memos
  const handleDrop = async (to: number) => {
    if (!dragGroupId) return;
    const groupId = dragGroupId;
    setDragGroupId(null);
    setHoverGap(null);

    const groups = await handleMovePortfolioGroup({
      subId: targetSubcategory._id,
      groupId,
      to,
      setNotice,
    });

    if (groups) applyGroups(groups);
  };

  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-h-0 text-white p-3">
      <h2 className="tracking-widest shrink-0">
        GROUPS IN <span className="text-rd">{targetSubcategory.name}</span>
      </h2>

      <div className="flex flex-col w-full max-w-md flex-1 min-h-0 overflow-y-auto">
        {sortedGroups.map((group: portfolio_group, index: number) => {
          const isLast = index === sortedGroups.length - 1;
          const rowClassName = [
            "flex items-center gap-3 border border-solid border-white p-2",
            // can't rely on the CSS :last-child variant here - the
            // trailing drop-zone below is the real last child of this
            // container, not the last group row
            isLast ? "border-b" : "border-b-0",
            // a row's top border marks the gap right above it (where a
            // drop would land) - the one exception is the trailing gap
            // after the last row, which has no row below it to own a top
            // border, so that one recolors the last row's bottom instead
            hoverGap === index ? "border-t-rd" : "",
            isLast && hoverGap === sortedGroups.length ? "border-b-rd" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={group.groupId}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                setDragGroupId(group.groupId);
              }}
              onDragEnd={() => setHoverGap(null)}
              onDragOver={(e) => {
                e.preventDefault();
                setHoverGap(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(index);
              }}
              className={rowClassName}
            >
              <DragHandle className="w-4 h-4 shrink-0 opacity-60 cursor-grab" />

              <button
                type="button"
                className="flex-1 text-left tracking-widest opacity-80 truncate xl:hover:text-rd focus:text-rd focus:outline-none transition-colors"
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
                className="shrink-0 border border-solid border-rd p-1 xl:hover:bg-rd/10 focus:outline-none transition-colors"
              >
                <Close className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {sortedGroups.length > 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setHoverGap(sortedGroups.length);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(sortedGroups.length);
            }}
            className="h-3 w-full"
          />
        ) : (
          <p className="opacity-60 text-center">NO GROUPS YET</p>
        )}
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
        className="flex gap-3 items-center shrink-0"
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
        <button type="submit" className={imageset_select_btns}>
          {spinner ? <Loading /> : "ADD GROUP"}
        </button>
      </form>

      {error.state ? <p className="text-rd shrink-0">{error.message}</p> : null}
    </div>
  );
}
