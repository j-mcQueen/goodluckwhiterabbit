import Add from "../../../assets/media/icons/Add";
import Search from "../../../assets/media/icons/Search";
import Sort from "../../../assets/media/icons/Sort";
import clicky from "../../../assets/media/sounds/CLICKY_.wav";

export default function Actions({ ...props }) {
  const { setActivePane } = props;

  return (
    <div className="flex items-center gap-5">
      <div className="flex flex-grow">
        <label className="flex flex-grow">
          <span className="h-[1px] w-[1px] m-[-1px] absolute overflow-hidden">
            SEARCH CLIENTS
          </span>

          <input
            type="search"
            name="search"
            id=""
            className="bg-black font-inter border border-solid border-white p-[10px] xl:min-w-[400px] text-ylw xl:focus:border-ylw xl:hover:border-ylw xl:focus:outline-none max-h-[40px] xl:transition-colors flex-grow"
          />
        </label>

        <button
          type="button"
          className="w-10 h-10 border border-l-0 border-solid border-white flex justify-center p-[10px] xl:focus:border-ylw xl:hover:border-ylw xl:transition-colors xl:focus:outline-none"
        >
          <Search className={"w-[18px] h-[18px]"} />
        </button>
      </div>

      <button
        type="button"
        className="w-10 h-10 xl:hover:drop-shadow-ylw border border-solid flex justify-center items-center xl:focus:border-ylw xl:hover:border-ylw xl:focus:outline-none xl:transition-all"
      >
        <Sort className={"w-[18px] h-[18px]"} />
      </button>

      <button
        onClick={() => {
          setActivePane("ADD");
          new Audio(clicky).play();
        }}
        type="button"
        className="w-10 h-10 xl:hover:drop-shadow-grn border border-solid flex justify-center items-center xl:focus:border-grn xl:transition-all xl:hover:border-grn xl:focus:outline-none"
      >
        <Add className={"w-[18px] h-[18px]"} />
      </button>
    </div>
  );
}
