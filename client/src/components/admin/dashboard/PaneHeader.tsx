import Close from "../../../assets/media/icons/Close";

export default function PaneHeader({ ...props }) {
  const { paneTitle, setActivePane } = props;

  return (
    <header className="flex justify-between items-center">
      <h2 className="italic tracking-wider">{paneTitle}</h2>

      <button
        type="button"
        className="bg-white  w-10 h-10 flex items-center justify-center xl:hover:bg-red-600 xl:focus:bg-red-600 outline-none transition-colors"
        onClick={() => setActivePane("ALL")}
      >
        <Close className={"w-[18px] h-[18px]"} />
      </button>
    </header>
  );
}
