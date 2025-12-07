import { Fragment } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
// import { handleMenuClick } from "./utils/handleMenuClick";
// import { MenuGroupClick } from "./types/MenuGroupClickTypes";

import MenuItem from "./menu/MenuItem";
import PrimaryCategoryButton from "./menu/SubcategoryButton";
import ProjectList from "./menu/GroupList";

export default function MobileMenu({ ...props }) {
  const {
    activeGroup,
    activeSub,
    animationVariants,
    data,
    setActiveGroup,
    setActiveSub,
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
                <PrimaryCategoryButton
                  label={subcategories[index]}
                  disabled={index !== 0}
                  isActive={activeSub === index}
                  onClick={() => {
                    setActiveSub(activeSub === index ? null : index);
                    setActiveGroup(0);
                  }}
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
                  <ProjectList
                    groups={Object.keys(sub)}
                    activeGroup={activeGroup}
                    onSelect={setActiveGroup}
                    className="border-t-0 mx-[-0.5px]"
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
