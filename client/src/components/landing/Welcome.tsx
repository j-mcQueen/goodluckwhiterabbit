import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import rabbit from "../../assets/media/gifs/glwr-lenticular.gif";
import SAILOR from "../../assets/media/sounds/CLOUD.DOMAIN.SLF..wav";

export default function Welcome() {
  return (
    <main className="w-[calc(100dvw-1.5rem)] h-[calc(100dvh-1.5rem)] flex items-center justify-center">
      <section className="flex flex-col items-center justify-center h-dvh">
        <img
          className="max-w-[350px]"
          src={rabbit}
          alt="A white rabbit against a black background shimmering from left to right"
        />

        <div>
          <h1 className="font-tnrBI whitespace-nowrap overflow-hidden animate-typing text-white py-6 xl:py-10 text-xl xl:text-4xl tracking-widest opacity-80 drop-shadow-glo">
            WELCOME TO MY WORLD
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: 2.1 },
          }}
          className="mt-20"
        >
          <Link
            to={"/art"}
            onClick={() => new Audio(SAILOR).play()}
            className="font-vt border border-solid border-white xl:hover:border-red xl:hover:text-rd xl:focus:text-rd xl:hover:drop-shadow-red focus:drop-shadow-red text-xl focus:outline-none xl:focus:border-rd text-white drop-shadow-glo opacity-80 py-1 px-2 xl:hover:bg-red-600 xl:transition-colors"
          >
            ENTER
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
