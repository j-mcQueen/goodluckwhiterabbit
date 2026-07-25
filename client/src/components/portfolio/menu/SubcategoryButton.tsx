import { generateKeys } from "../../global/utils/generateKeys";
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
  setNextStartIndex,
  setNotice,
  setStaticKeys,
}: SubcategoryButton_T) {
  return (
    <button
      disabled={disabled}
      onClick={async () => {
        if (bodyRef) {
          bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }

        try {
          const nextImages = await handleClick(
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

          if (nextImages) {
            setStaticKeys(generateKeys(nextImages.length));
            setNextStartIndex(nextImages.length);
          }

          setActiveGroup(0);
        } catch (error) {
          setNotice({
            status: true,
            loading: false,
            message: "Something went wrong. Please try again.",
          });
        }
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
