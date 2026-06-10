import { sidebar_data } from "./data/sidebar/data";
import { triggerBatch } from "./utils/triggerBatch";

import Menu from "./Menu";
import GroupList from "./menu/GroupList";

export default function Sidebar({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    bodyRef,
    route,
    setActiveGroup,
    setActiveSub,
    setImages,
    setNotice,
  } = props;

  const groups =
    sidebar_data[route as keyof typeof sidebar_data].menu[activeSub];

  const subcategories =
    sidebar_data[route as keyof typeof sidebar_data].subcategories;

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
    <aside className="flex xl:min-w-[245px] xl:max-w-[245px] xl:h-[calc(100dvh-57px-1.5rem)] text-white overflow-x-scroll overflow-y-hidden">
      {activeTab === 0 ? (
        <>
          <ul className="flex flex-row-reverse xl:h-[calc(100dvh-57px-1.5rem)] [writing-mode:sideways-lr]">
            <div className={`max-w-[189px] h-full`}>
              <GroupList
                activeGroup={activeGroup}
                activeSub={activeSub}
                activeTab={activeTab}
                bodyRef={bodyRef}
                groups={Object.keys(groups)}
                handleClick={triggerBatch}
                setActiveGroup={setActiveGroup}
                setImages={setImages}
                setNotice={setNotice}
              />
            </div>
          </ul>

          <Menu
            activeSub={activeSub}
            activeTab={activeTab}
            animationVariants={animationVariants}
            bodyRef={bodyRef}
            setActiveGroup={setActiveGroup}
            setActiveSub={setActiveSub}
            setImages={setImages}
            setNotice={setNotice}
            subcategories={subcategories}
          />
        </>
      ) : null}
    </aside>
  );
}
