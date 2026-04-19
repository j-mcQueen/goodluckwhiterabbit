import { SubcategoryButton_T } from "../types/SubcategoryButton_T";

export default function SubcategoryButton({
  activeSub,
  activeTab,
  bodyRef,
  className = "",
  disabled,
  handleClick,
  index,
  label,
  setActiveGroup,
  setActiveSub,
  setImages,
  setNotice,
}: SubcategoryButton_T) {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (bodyRef) {
          bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }

        handleClick(
          activeSub,
          activeTab,
          0,
          setImages,
          setNotice,
          true,
          0,
          index,
          setActiveSub,
        );
        setActiveGroup(0);
      }}
      className={`
        [writing-mode:vertical-rl] 
        h-full
        ${Number(activeSub) === index ? "text-ylw" : ""}
        ${disabled ? "text-gray" : ""}
        ${className}
      `}
    >
      {label}
    </button>
  );
}
