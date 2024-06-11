import Add from "../../../assets/media/icons/Add";
import Search from "../../../assets/media/icons/Search";
import Sort from "../../../assets/media/icons/Sort";

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
            placeholder="SEARCH CLIENTS"
            className="bg-black font-inter border border-solid border-gray p-[10px] xl:min-w-[400px] text-ylw xl:focus:border-blu xl:focus:outline-none max-h-[40px] flex-grow"
          />
        </label>

        <button
          type="button"
          className="w-10 h-10 border border-l-0 border-solid border-gray flex justify-center p-[10px] xl:focus:bg-blu xl:focus:border-blu xl:hover:border-blu xl:transition-colors xl:hover:bg-blu xl:focus:outline-none"
        >
          <Search className={"w-[18px] h-[18px]"} />
        </button>
      </div>

      <button
        type="button"
        className="w-10 h-10 border border-solid border-gray flex justify-center items-center xl:focus:border-ylw xl:hover:border-ylw xl:focus:outline-none xl:transition-colors"
      >
        <Sort className={"w-[18px] h-[18px]"} />
      </button>

      <button
        onClick={() => setActivePane("ADD")}
        type="button"
        className="w-10 h-10 border border-solid border-green-600 flex justify-center items-center xl:focus:bg-green-600 xl:transition-colors xl:hover:bg-green-600 xl:focus:outline-none"
      >
        <Add className={"w-[18px] h-[18px]"} />
      </button>
    </div>
  );
}
