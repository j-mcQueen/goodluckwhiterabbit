import { Fragment } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { triggerBatch } from "./utils/triggerBatch";

import MenuItem from "./menu/MenuItem";
import SubcategoryButton from "./menu/SubcategoryButton";
import GroupList from "./menu/GroupList";

export default function MobileMenu({ ...props }) {
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
    <ul className="flex flex-row max-h-[150px] w-full justify-evenly">
      {data.map((sub: object, index: number) => {
        return (
          <Fragment key={subcategories[index]}>
            <MenuItem
              animationVariants={animationVariants}
              index={index}
              className={`${index === 0 ? "border-l-0" : ""} ${index === data.length - 1 ? "border-r-0" : ""} h-full flex flex-row-reverse border border-white border-t-0 mx-[-0.5px] border-solid justify-center flex-none w-[calc((100dvw-1.5rem+2px)/4)]`}
            >
              <div className="h-full flex items-end">
                <SubcategoryButton
                  activeSub={activeSub}
                  activeTab={activeTab}
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

            <AnimatePresence mode="sync">
              {activeSub === index && (
                <motion.li
                  key={`submenu-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <GroupList
                    activeGroup={activeGroup}
                    activeSub={activeSub}
                    activeTab={activeTab}
                    className="border-t-0 mx-[-0.5px]"
                    groups={Object.keys(sub)}
                    handleClick={triggerBatch}
                    images={images}
                    setActiveGroup={setActiveGroup}
                    setImages={setImages}
                    setNotice={setNotice}
                  />
                </motion.li>
              )}
            </AnimatePresence>
          </Fragment>
        );
      })}
    </ul>
  );
}
