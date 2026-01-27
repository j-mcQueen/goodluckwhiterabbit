import { SubcategoryButton_T } from "../types/SubcategoryButton_T";

export default function SubcategoryButton({
  activeSub,
  activeTab,
  className = "",
  disabled,
  handleClick,
  images,
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
      onClick={() =>
        handleClick(
          activeSub,
          activeTab,
          images,
          0,
          setActiveGroup,
          setImages,
          setNotice,
          0,
          index,
          setActiveSub,
        )
      }
      className={`
        [writing-mode:vertical-rl] 
        h-full p-3 py-5
        ${Number(activeSub) === index ? "text-ylw" : ""}
        ${disabled ? "text-gray" : ""}
        ${className}
      `}
    >
      {label}
    </button>
  );
}
