import Close from "../../../assets/media/icons/Close";
import clicky from "../../../assets/media/sounds/CLICKY_.wav";

export default function PaneHeader({ ...props }) {
  const { paneTitle, setActivePane } = props;

  return (
    <header className="flex justify-between items-center">
      <h2 className="italic tracking-wider">{paneTitle}</h2>

      <button
        type="button"
        className="border border-solid border-mag drop-shadow-mag xl:hover:border-red xl:hover:drop-shadow-red w-10 h-10 flex items-center justify-center xl:focus:border-red xl:focus:drop-shadow-red outline-none transition-colors"
        onClick={() => {
          setActivePane("ALL");
          new Audio(clicky).play();
        }}
      >
        <Close className={"w-[18px] h-[18px]"} customColor={"#FFF"} />
      </button>
    </header>
  );
}
