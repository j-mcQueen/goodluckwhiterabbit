import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { mobile } from "../user/dashboard/utils/determineViewport";
import { playSound } from "../global/utils/sound";

export default function Segment({ ...props }) {
  const { alt, path, source, text } = props;

  const dims = {
    m: "w-dvw opacity-70",
    d: "h-dvh opacity-70",
  };

  return (
    <Link to={path} onClick={playSound}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex items-center justify-center border border-white border-solid overflow-hidden m-[-1px]"
      >
        <h2 className="text-white absolute text-center text-4xl z-50">
          {text}
        </h2>

        <img
          src={source}
          alt={alt}
          className={`${mobile ? dims.m : dims.d} object-cover xl:hover:scale-110 transition-transform duration-500`}
        />
      </motion.div>
    </Link>
  );
}
