import { GroupList_T } from "../types/GroupList_T";

export default function GroupList({
  activeGroup,
  activeSub,
  activeTab,
  className = "",
  groups,
  handleClick,
  images,
  setActiveGroup,
  setImages,
  setNotice,
}: GroupList_T) {
  return (
    <ul className="flex flex-col items-start [writing-mode:horizontal-tb] w-full relative overflow-y-scroll max-h-[169px] border-b border-solid">
      {groups.map((group, j) => (
        <li
          key={group}
          className={`${className} ${j === 0 ? "border-t-0" : ""} ${j === groups.length - 1 ? "border-b-0" : ""} border border-stone-200 border-solid w-full py-5 -my-[0.5px] flex items-center justify-center border-r-0 border-l-0`}
        >
          <button
            className={`${j === activeGroup ? "" : "opacity-40"} drop-shadow-glo text-stone-200`}
            onClick={() => {
              handleClick(
                activeSub,
                activeTab,
                images,
                j + 1,
                setImages,
                setNotice,
                0,
              );
              setActiveGroup(j);
            }}
          >
            {group}
          </button>
        </li>
      ))}
    </ul>
  );
}
