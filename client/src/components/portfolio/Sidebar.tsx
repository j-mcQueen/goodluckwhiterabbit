import { sidebar_data } from "./data/sidebar/data";

import Menu from "./Menu";
import MobileMenu from "./MobileMenu";

export default function Sidebar({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    images,
    mobile,
    route,
    setActiveGroup,
    setActiveSub,
    setImages,
    setNotice,
  } = props;

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

  return (
    <aside className="flex xl:flex-col xl:min-w-[245px] xl:max-w-[245px] h-[calc(100dvh-57px-1.5rem)] text-white overflow-x-scroll">
      {activeTab === 0 ? (
        mobile ? (
          <MobileMenu
            activeGroup={activeGroup}
            activeSub={activeSub}
            activeTab={activeTab}
            animationVariants={animationVariants}
            data={categoryData}
            images={images}
            setActiveGroup={setActiveGroup}
            setActiveSub={setActiveSub}
            setImages={setImages}
            setNotice={setNotice}
            subcategories={subcategories}
          />
        ) : (
          <Menu
            activeGroup={activeGroup}
            activeSub={activeSub}
            activeTab={activeTab}
            animationVariants={animationVariants}
            data={categoryData}
            images={images}
            setActiveGroup={setActiveGroup}
            setActiveSub={setActiveSub}
            setImages={setImages}
            setNotice={setNotice}
            subcategories={subcategories}
          />
        )
      ) : null}
    </aside>
  );
}
