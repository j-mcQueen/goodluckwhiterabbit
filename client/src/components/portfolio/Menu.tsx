import { triggerBatch } from "./utils/triggerBatch";

import SubcategoryButton from "./menu/SubcategoryButton";
import MenuItem from "./menu/MenuItem";

export default function Menu({ ...props }) {
  const {
    activeSub,
    activeTab,
    animationVariants,
    bodyRef,
    setActiveGroup,
    setActiveSub,
    setImages,
    setNotice,
    subcategories,
  } = props;

  return (
    <div className="flex max-h-[calc((100%/5)+1px)]">
      <ul>
        {subcategories.map((sub: string, index: number) => {
          return (
            <MenuItem
              animationVariants={animationVariants}
              className="tracking-widest leading-none h-full -my-[1px]"
              index={index}
              key={sub[index]}
            >
              <SubcategoryButton
                activeSub={activeSub}
                activeTab={activeTab}
                bodyRef={bodyRef}
                className={`${index === subcategories.length - 1 ? "border-b-0" : null} ${index === activeSub ? "border-r-black" : null} border border-white border-solid w-[56px]`}
                disabled={index !== 0}
                handleClick={triggerBatch}
                index={index}
                label={subcategories[index]}
                setActiveGroup={setActiveGroup}
                setActiveSub={setActiveSub}
                setImages={setImages}
                setNotice={setNotice}
              />
            </MenuItem>
          );
        })}
      </ul>
    </div>
  );
}
