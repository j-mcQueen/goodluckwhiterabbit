import { Fragment } from "react/jsx-runtime";

import SubcategoryButton from "./menu/SubcategoryButton";
import MenuItem from "./menu/MenuItem";
import GroupList from "./menu/GroupList";

export default function Menu({ ...props }) {
  const {
    activeGroup,
    activeSub,
    animationVariants,
    data,
    setActiveGroup,
    setActiveSub,
    subcategories,
  } = props;

  // 4 scenarios need accounted for:
  // 1. User loads into page and views first set of images on photography + weddings page
  // 2. User scrolls to load next set of images (handleIntersection)
  // 3. User clicks on a sidebar item to load a different category
  // 4. What happens to the UI when a user loads enough images to scroll to the next sub-category

  return (
    <ul className="flex flex-row-reverse h-full [writing-mode:sideways-lr]">
      {data.map((sub: object, index: number) => {
        return (
          <Fragment key={subcategories[index]}>
            <MenuItem
              animationVariants={animationVariants}
              index={index}
              className="tracking-widest leading-none h-full -my-[0.5px]"
            >
              <div
                className={`${activeSub === index ? "" : "invisible"} overflow-x-scroll max-w-[189px]`}
              >
                <GroupList
                  groups={Object.keys(sub)}
                  activeGroup={activeGroup}
                  onSelect={setActiveGroup}
                />
              </div>

              <div className="h-full flex items-end">
                <SubcategoryButton
                  label={subcategories[index]}
                  className={`${index === data.length - 1 ? "border-b-0" : null} ${index === activeSub ? "border-r-black" : null} border border-white border-solid w-[56px]`}
                  disabled={index !== 0}
                  isActive={activeSub === index}
                  onClick={() => {
                    setActiveGroup(0);
                    setActiveSub(index);
                  }}
                />
              </div>
            </MenuItem>
          </Fragment>
        );
      })}
    </ul>
  );
}
