import { AnimatePresence, motion } from "framer-motion";
import ListItem from "./ListItem";

const rowStyles = "flex-1 min-h-[54.2px] w-full flex items-center overflow-hidden";

export default function BrowseColumns({
  subcategories,
  groups,
  selectedSub,
  onSubcategoryClick,
  activeSubIndex,
  activeGroupIndex,
  handleGroupClick,
}: {
  subcategories: string[];
  groups: string[];
  selectedSub: number;
  onSubcategoryClick: (index: number) => void;
  activeSubIndex: number;
  activeGroupIndex: number;
  handleGroupClick: (groupIndex: number) => void;
}) {
  return (
    <div className="flex w-full h-full overflow-hidden">
      <ul className="w-1/2 h-full flex flex-col divide-y divide-solid divide-white overflow-y-auto border-r border-solid border-white">
        {subcategories.map((subcategory: string, j: number) => (
          <div className={rowStyles} key={subcategory}>
            <ListItem
              active={j === activeSubIndex}
              label={subcategory}
              handleClick={() => onSubcategoryClick(j)}
            />
          </div>
        ))}
      </ul>

      <AnimatePresence mode="wait">
        <motion.ul
          key={selectedSub}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="w-1/2 h-full flex flex-col divide-y divide-solid divide-white overflow-y-auto"
        >
          {groups.map((group: string, k: number) => (
            <div className={rowStyles} key={group}>
              <ListItem
                active={selectedSub === activeSubIndex && k === activeGroupIndex}
                label={group}
                handleClick={() => handleGroupClick(k)}
              />
            </div>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
