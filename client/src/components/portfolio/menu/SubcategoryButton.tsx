import { generateKeys } from "../../global/utils/generateKeys";
import { SubcategoryButton_T } from "../types/SubcategoryButton_T";

export default function SubcategoryButton({
  activeSub,
  activeSubName,
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
            activeSubName,
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
        group
        ${Number(activeSub) === index ? "text-xl text-rd drop-shadow-red xl:focus:outline-none" : "drop-shadow-glo text-white/70 xl:hover:opacity-100 xl:focus:opacity-100 xl:hover:text-rd xl:focus:text-rd transition-colors xl:focus:outline-none xl:focus:drop-shadow-red xl:hover:drop-shadow-red"}
        ${disabled ? "text-gray" : ""}
        ${className}
      `}
    >
      <span
        className={`inline-block ${Number(activeSub) === index ? "xl:group-focus:animate-wiggleY" : ""}`}
      >
        {label}
      </span>
    </button>
  );
}
