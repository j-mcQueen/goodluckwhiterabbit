import { useCallback, useEffect, useRef } from "react";
import { GroupList_T } from "../types/GroupList_T";

export default function GroupList({
  activeGroup,
  activeSub,
  activeTab,
  bodyRef,
  className = "",
  groups,
  handleClick,
  setActiveGroup,
  setImages,
  setNotice,
}: GroupList_T) {
  const groupItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement | null>(null);

  const scrollToGroup = useCallback((index: number) => {
    // useCallback prevents iLoops and helps keep things DRY async
    const activeEl = groupItemRefs.current[index];
    const listEl = listRef.current;

    if (activeEl && listEl) {
      listEl.scrollTo({
        top: activeEl.offsetTop - listEl.offsetTop,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToGroup(activeGroup);
  }, [activeGroup, scrollToGroup]);

  return (
    <ul
      className="flex flex-col justify-start [writing-mode:horizontal-tb] h-full w-full overflow-y-scroll bg-black"
      ref={listRef}
    >
      {groups.map((group, j) => (
        <li
          className={`${className} ${j === 0 ? "border-t-0" : ""} ${j === groups.length - 1 ? "border-b-0" : ""} border border-stone-200 border-solid w-full py-5 -my-[0.5px] flex items-center justify-center border-r-0 border-l-0 px-7 xl:px-0 min-h-[61px]`}
          key={group}
          ref={(el) => {
            groupItemRefs.current[j] = el;
          }}
        >
          <button
            className={`${j === activeGroup ? "" : "opacity-40"} drop-shadow-glo text-stone-200`}
            onClick={async () => {
              scrollToGroup(j);
              if (bodyRef) {
                bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }

              handleClick(
                activeSub,
                activeTab,
                j + 1,
                setImages,
                setNotice,
                true,
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
