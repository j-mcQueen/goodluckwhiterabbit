import Close from "../../../assets/media/icons/Close";
import clicky from "../../../assets/media/sounds/CLICKY_.wav";

export default function PaneHeader({ ...props }) {
  const { paneTitle, setActivePane } = props;

  return (
    <header className="flex justify-between items-center pb-5">
      <h2 className="text-xl">{paneTitle}</h2>

      <button
        type="button"
        className="border border-solid border-white xl:hover:border-rd w-10 h-10 flex items-center justify-center focus:border-red outline-none transition-colors"
        onClick={() => {
          setActivePane("ALL");
          new Audio(clicky).play();
        }}
      >
        <Close className="w-4 4" customColor={"#FFF"} />
      </button>
    </header>
  );
}
