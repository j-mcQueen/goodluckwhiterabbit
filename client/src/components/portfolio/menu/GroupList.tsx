import { useCallback, useEffect, useRef } from "react";
import { generateKeys } from "../../global/utils/generateKeys";
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
  setNextStartIndex,
  setNotice,
  setStaticKeys,
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
          className={`${className} ${j === 0 ? "border-t-0" : ""} ${j === groups.length - 1 ? "border-b-0" : ""} border border-white border-solid w-full py-5 -my-[0.5px] flex items-center justify-center border-r-0 border-l-0 px-7 xl:px-0 min-h-[61px] tracking-wide`}
          key={group}
          ref={(el) => {
            groupItemRefs.current[j] = el;
          }}
        >
          <button
            className={`${j === activeGroup ? "text-rd drop-shadow-red xl:focus:outline-none" : "text-white/70 xl:hover:opacity-100 xl:focus:opacity-100 xl:hover:text-rd xl:focus:text-rd transition-colors xl:focus:outline-none xl:focus:drop-shadow-red xl:hover:drop-shadow-red"} drop-shadow-glo text-xl tracking-vt`}
            onClick={async () => {
              scrollToGroup(j);
              if (bodyRef) {
                bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }

              try {
                const nextImages = await handleClick(
                  activeSub,
                  activeTab,
                  j + 1,
                  setImages,
                  setNotice,
                  true,
                  0,
                );

                if (nextImages) {
                  setStaticKeys(generateKeys(nextImages.length));
                  setNextStartIndex(nextImages.length);
                }

                setActiveGroup(j);
              } catch (error) {
                setNotice({
                  status: true,
                  loading: false,
                  message: "Something went wrong. Please try again.",
                });
              }
            }}
          >
            {group}
          </button>
        </li>
      ))}
    </ul>
  );
}
