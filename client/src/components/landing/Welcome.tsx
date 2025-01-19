import { Link } from "react-router-dom";
import rabbit from "../../assets/media/gifs/glwr-lenticular.gif";

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

        <Link
          to={"/art"}
          className="font-tnrBI border border-solid border-white xl:hover:border-red xl:hover:text-rd xl:focus:text-rd xl:hover:drop-shadow-red focus:drop-shadow-red text-xl text-white drop-shadow-glo tracking-widest opacity-80 pt-1 px-5 xl:hover:bg-red-600 xl:transition-colors"
        >
          ENTER
        </Link>
      </section>
    </main>
  );
}
