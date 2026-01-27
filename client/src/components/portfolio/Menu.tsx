import { Fragment } from "react/jsx-runtime";
import { triggerBatch } from "./utils/triggerBatch";

import SubcategoryButton from "./menu/SubcategoryButton";
import MenuItem from "./menu/MenuItem";
import GroupList from "./menu/GroupList";

export default function Menu({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    animationVariants,
    data,
    images,
    setActiveGroup,
    setActiveSub,
    setImages,
    setNotice,
    subcategories,
  } = props;

  return (
    <ul className="flex flex-row-reverse h-full [writing-mode:sideways-lr]">
      {data.map((sub: object, index: number) => {
        return (
          <Fragment key={subcategories[index]}>
            <MenuItem
              animationVariants={animationVariants}
              className="tracking-widest leading-none h-full -my-[0.5px]"
              index={index}
            >
              <div
                className={`${activeSub === index ? "" : "invisible"} overflow-x-scroll max-w-[189px]`}
              >
                <GroupList
                  activeGroup={activeGroup}
                  activeSub={activeSub}
                  activeTab={activeTab}
                  groups={Object.keys(sub)}
                  handleClick={triggerBatch}
                  images={images}
                  setActiveGroup={setActiveGroup}
                  setImages={setImages}
                  setNotice={setNotice}
                />
              </div>

              <div className="h-full flex items-end">
                <SubcategoryButton
                  activeSub={activeSub}
                  activeTab={activeTab}
                  className={`${index === data.length - 1 ? "border-b-0" : null} ${index === activeSub ? "border-r-black" : null} border border-white border-solid w-[56px]`}
                  disabled={index !== 0}
                  handleClick={triggerBatch}
                  images={images}
                  index={index}
                  label={subcategories[index]}
                  setActiveGroup={setActiveGroup}
                  setActiveSub={setActiveSub}
                  setImages={setImages}
                  setNotice={setNotice}
                />
              </div>
            </MenuItem>
          </Fragment>
        );
      })}
    </ul>
  );
}
