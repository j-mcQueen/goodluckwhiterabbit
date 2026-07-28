import { triggerBatch } from "./utils/triggerBatch";

import Menu from "./Menu";
import GroupList from "./menu/GroupList";

export default function Sidebar({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeSubName,
    activeTab,
    bodyRef,
    route,
    sidebarData,
    setActiveGroup,
    setActiveSub,
    setImages,
    setNextStartIndex,
    setNotice,
    setStaticKeys,
  } = props;

  const groups = sidebarData[route]?.menu[activeSub] ?? {};

  const subcategories = sidebarData[route]?.subcategories ?? [];

  const animationVariants = {
    initial: {
      x: -20,
      opacity: 0,
    },
    animate: (index: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.05 * index },
    }),
  };

  return (
    <aside className="flex xl:min-w-sidebar xl:max-w-sidebar xl:h-[calc(100dvh-57px-var(--frame))] text-white overflow-x-scroll overflow-y-hidden">
      {activeTab === 0 ? (
        <>
          <ul className="flex flex-row-reverse xl:h-[calc(100dvh-57px-var(--frame))] [writing-mode:sideways-lr]">
            <div className={`max-w-[189px] h-full`}>
              <GroupList
                activeGroup={activeGroup}
                activeSub={activeSubName}
                activeTab={activeTab}
                bodyRef={bodyRef}
                groups={Object.keys(groups)}
                handleClick={triggerBatch}
                setActiveGroup={setActiveGroup}
                setImages={setImages}
                setNextStartIndex={setNextStartIndex}
                setNotice={setNotice}
                setStaticKeys={setStaticKeys}
              />
            </div>
          </ul>

          <Menu
            activeSub={activeSub}
            activeSubName={activeSubName}
            activeTab={activeTab}
            animationVariants={animationVariants}
            bodyRef={bodyRef}
            setActiveGroup={setActiveGroup}
            setActiveSub={setActiveSub}
            setImages={setImages}
            setNextStartIndex={setNextStartIndex}
            setNotice={setNotice}
            setStaticKeys={setStaticKeys}
            subcategories={subcategories}
          />
        </>
      ) : null}
    </aside>
  );
}
