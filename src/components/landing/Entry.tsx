import { Link } from "react-router-dom";
import rabbit from "../../assets/media/glwr-lenticular.gif";

export default function Entry() {
  return (
    <main className="w-[calc(100dvw-1.5rem)] h-[calc(100dvh-1.5rem)] flex items-center justify-center">
      <section className="flex flex-col items-center justify-center">
        <img
          className="max-w-[350px]"
          src={rabbit}
          alt="A white rabbit against a black background shimmering from left to right"
        />

        <h1 className="text-white py-6 xl:py-10 text-xl xl:text-3xl italic">
          WELCOME TO MY WORLD
        </h1>

        <Link
          to={"/photo"}
          className="border border-solid border-red-600 text-lg text-white py-3 px-5 xl:hover:bg-red-600 xl:hover:text-black xl:transition-colors italic leading-none"
        >
          ENTER
        </Link>
      </section>
    </main>
  );
}
