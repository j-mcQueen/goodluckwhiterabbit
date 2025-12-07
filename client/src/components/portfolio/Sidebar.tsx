import { useState } from "react";
import { sidebar_data } from "./data/sidebar/data";

import Menu from "./Menu";
import MobileMenu from "./MobileMenu";

export default function Sidebar({ ...props }) {
  const { activeTab, mobile, route } = props;

  const categoryData = sidebar_data[route as keyof typeof sidebar_data].menu;
  const subcategories = [
    "WEDDINGS",
    "EVENTS",
    "FILM",
    "COMMERCIAL",
    "EDITORIAL",
  ];
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

  const [activeSub, setActiveSub] = useState<number | null>(null); // updates when sidebar items are clicked
  const [activeGroup, setActiveGroup] = useState(0); // updates when we have pulled images in the next group

  return (
    <aside className="flex xl:flex-col xl:min-w-[245px] xl:max-w-[245px] h-[calc(100dvh-57px-1.5rem)] text-white overflow-x-scroll">
      {/* {!mobile ? (
        <p
          className={`${activeTab !== 0 ? "h-full" : null} flex xl:block items-center justify-between px-5 pb-5 pt-3 border-r border-solid border-white text-lg leading-tight`}
        >
          {sidebar_data[route as keyof typeof sidebar_data].bio}
        </p>
      ) : null} */}

      {activeTab === 0 ? (
        mobile ? (
          <MobileMenu
            activeGroup={activeGroup}
            activeSub={activeSub}
            animationVariants={animationVariants}
            data={categoryData}
            setActiveGroup={setActiveGroup}
            setActiveSub={setActiveSub}
            subcategories={subcategories}
          />
        ) : (
          <Menu
            activeGroup={activeGroup}
            activeSub={activeSub}
            animationVariants={animationVariants}
            data={categoryData}
            setActiveGroup={setActiveGroup}
            setActiveSub={setActiveSub}
            subcategories={subcategories}
          />
        )
      ) : null}
    </aside>
  );
}
