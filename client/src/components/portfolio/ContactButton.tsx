import { mobile } from "../global/utils/determineViewport";
import Mail from "../../assets/media/icons/Mail";

export default function ContactButton({ ...props }) {
  const { setContactOpen } = props;

  const styleVariants = {
    mobile: {
      cntr: "w-full h-full text-center",
      button: "w-full h-full flex justify-center py-2",
      svg: "w-[24px] h-[24px]",
    },
    desktop: {
      cntr: "border border-white border-solid absolute bottom-0 right-0 -m-[0.5px] bg-black",
      button:
        "text-white text-lg xl:hover:text-rd xl:transition-colors group flex items-center",
      svg: "w-[24px] h-[24px] xl:group-hover:drop-shadow-red xl:group-hover:fill-rd xl:group-focus:drop-shadow-red xl:group-focus:fill-rd xl:transition-colors m-5",
    },
  };

  return (
    <div
      className={
        mobile ? styleVariants.mobile.cntr : styleVariants.desktop.cntr
      }
    >
      <button
        type="button"
        onClick={() => setContactOpen((prev: boolean) => !prev)}
        className={
          mobile ? styleVariants.mobile.button : styleVariants.desktop.button
        }
      >
        <Mail
          className={
            mobile ? styleVariants.mobile.svg : styleVariants.desktop.svg
          }
        />
      </button>
    </div>
  );
}
