// import { Link } from "react-router-dom";
import rabbit from "../../assets/media/gifs/glwr-lenticular.gif";

export default function Entry() {
  return (
    // <main className="w-[calc(100dvw-1.5rem)] h-[calc(100dvh-1.5rem)] flex items-center justify-center">
    //   <section className="flex flex-col items-center justify-center">
    //     <img
    //       className="max-w-[350px]"
    //       src={rabbit}
    //       alt="A white rabbit against a black background shimmering from left to right"
    //     />

    //     <h1 className="font-liquid text-white py-6 xl:py-10 text-xl xl:text-4xl">
    //       welcome to my world
    //     </h1>

    //     <Link
    //       to={"/photo"}
    //       className="border border-solid border-white xl:hover:border-red xl:hover:drop-shadow-red focus:drop-shadow-red text-lg text-white py-1 px-5 xl:hover:bg-red-600 xl:transition-colors"
    //     >
    //       ENTER
    //     </Link>
    //   </section>
    // </main>
    <main className="w-[calc(100dvw-1.5rem)] h-[calc(100dvh-1.5rem)] flex flex-col overflow-y-hidden">
      <section className="grid grid-rows-3 items-center justify-center h-dvh">
        <div className="flex justify-center">
          <img
            className="block xl:max-w-[500px] max-w-[300px]"
            src={rabbit}
            alt="A white rabbit against a black background shimmering from left to right"
          />
        </div>

        <h1 className="font-liquid drop-shadow-glo opacity-80 text-white text-2xl xl:text-4xl xl:pt-0 tracking-widest text-center xl:px-0 z-10">
          welcome to my world
        </h1>

        <div className="font-inter text-white text-[12px] xl:text-lg tracking-widest text-center">
          <p className="text-center px-3 xl:px-0 drop-shadow-[1px_1px_1px_rgba(255,245,0,0.5)]">
            THE DIGITAL EXPERIENCE IS ARRIVING FORTHWITH !
          </p>

          <p className="pt-7">
            FOR INQUIRIES, CLICK&nbsp;
            <a
              href="mailto:goodluckwhiterabbit@gmail.com"
              className="border border-solid border-white xl:hover:border-red py-1 pl-[10px] pr-[8px] xl:transition-all xl:hover:drop-shadow-[2px_2px_2px_rgba(220,38,38,1)]"
            >
              HERE
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
