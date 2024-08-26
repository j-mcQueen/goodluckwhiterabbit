import Add from "../../../assets/media/icons/Add";
import Search from "../../../assets/media/icons/Search";
import clicky from "../../../assets/media/sounds/CLICKY_.wav";

export default function Actions({ ...props }) {
  const { setActivePane } = props;

  return (
    <div className="flex items-start gap-3 p-3">
      <div className="flex flex-grow">
        <div className="w-full">
          <label className="flex pb-2">
            <span className="h-[1px] w-[1px] m-[-1px] absolute overflow-hidden">
              SEARCH CLIENTS
            </span>

            <input
              type="search"
              name="search"
              id=""
              placeholder="SEARCH ARCHIVE"
              className="bg-black border border-solid border-white xl:hover:border-rd focus:outline-none transition-colors text-white p-[10px] max-h-[40px] flex-grow placeholder:text-white"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              className="py-1 px-2 border border-solid border-white xl:hover:bg-white xl:hover:text-black focus:text-rd focus:outline-none transition-colors"
            >
              DATE
            </button>

            <button
              type="button"
              className="py-1 px-2 border border-solid border-white xl:hover:bg-white xl:hover:text-black focus:text-rd focus:outline-none transition-colors"
            >
              A-Z
            </button>
          </div>
        </div>

        <button
          type="button"
          className="w-10 h-10 border border-l-0 border-solid flex justify-center p-[10px] focus:border-rd xl:hover:border-rd xl:transition-colors xl:focus:outline-none"
        >
          <Search className={"w-[18px] h-[18px]"} />
        </button>
      </div>

      <button
        onClick={() => {
          setActivePane("ADD");
          new Audio(clicky).play();
        }}
        type="button"
        className="w-10 h-10 border border-solid flex justify-center items-center focus:border-rd xl:transition-all xl:hover:border-rd xl:focus:outline-none"
      >
        <Add className={"w-[18px] h-[18px]"} />
      </button>
    </div>
  );
}
