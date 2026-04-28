import { Link } from "react-router-dom";
import rabbit from "../../../../assets/media/gifs/glwr-lenticular.gif";

export default function TopBar({ ...props }) {
  const { isOpen, logout, setIsOpen } = props;

  const Rabbit = () => {
    return (
      <img
        src={rabbit}
        alt="A white rabbit against a black background shimmering from left to right"
        className="max-h-[48px]"
      />
    );
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="w-full">
        {logout ? (
          <Rabbit />
        ) : (
          <Link to={"/"} className="w-full h-full flex justify-center">
            <Rabbit />
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? "bg-black" : "bg-white"} min-w-[50px] h-[50px] border-l border-solid border-white flex items-center justify-center transition-colors`}
      >
        <div
          className={`${isOpen ? "rotate-45 bg-white" : "-rotate-45 bg-black"} w-[25px] h-[1px] transition-all`}
        ></div>
      </button>
    </div>
  );
}
