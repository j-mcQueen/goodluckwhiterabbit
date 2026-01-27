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
    <ul
      className={`
        flex flex-col-reverse 
        [writing-mode:vertical-rl]`}
    >
      {groups.map((group, j) => (
        <li
          key={group}
          className={`${className} ${j === 0 ? "border-l-0" : ""} ${j === groups.length - 1 ? "border-r-0" : ""} border border-stone-200 border-solid w-[64px] -mx-[0.5px] flex items-center justify-center `}
        >
          <button
            className={`${j === activeGroup ? "" : "opacity-40"} drop-shadow-glo text-stone-200`}
            onClick={() =>
              handleClick(
                activeSub,
                activeTab,
                images,
                j + 1,
                setActiveGroup,
                setImages,
                setNotice,
                0,
              )
            }
          >
            {group}
          </button>
        </li>
      ))}
    </ul>
  );
}
