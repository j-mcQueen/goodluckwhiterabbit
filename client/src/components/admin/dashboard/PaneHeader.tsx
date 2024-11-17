import { icons } from "./styles/styles";
import Close from "../../../assets/media/icons/Close";
import clicky from "../../../assets/media/sounds/CLICKY_.wav";

export default function PaneHeader({ ...props }) {
  const { paneTitle, setActivePane } = props;

  return (
    <header className="flex justify-between items-center pb-5">
      <h2 className="text-xl font-tnrBI drop-shadow-glo tracking-widest opacity-80">
        {paneTitle}
      </h2>

      <button
        type="button"
        className="border border-solid border-white xl:hover:border-rd p-2 flex items-center justify-center focus:border-red outline-none transition-colors group"
        onClick={() => {
          setActivePane("ALL");
          new Audio(clicky).play();
        }}
      >
        <Close className={icons} />
      </button>
    </header>
  );
}
