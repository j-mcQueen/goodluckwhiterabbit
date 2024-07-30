import rabbit from "../../assets/media/gifs/glwr-lenticular.gif";

export default function UnderConstruction() {
  return (
    <main className="w-[calc(100dvw-1.5rem)] h-[calc(100dvh-1.5rem)] flex flex-col overflow-y-scroll">
      <section className="grid grid-rows-3 items-center justify-center h-dvh">
        <div className="flex justify-center">
          <img
            className="block xl:max-w-[500px] max-w-[300px]"
            src={rabbit}
            alt="A white rabbit against a black background shimmering from left to right"
          />
        </div>

        <h1 className="drop-shadow-[1px_1px_1px_rgba(0,255,255,1)] text-white text-xl xl:text-4xl xl:pt-0 tracking-widest italic text-center  xl:px-0 z-10">
          WELCOME TO MY WORLD
        </h1>

        <div className="font-inter text-white text-[10px] xl:text-sm tracking-widest text-center [word-spacing:3px]">
          <p className="leading-4 xl:leading-9 text-center px-3 xl:px-0 drop-shadow-[1px_1px_1px_rgba(255,245,0,0.5)]">
            THE DIGITAL EXPERIENCE IS ARRIVING FORTHWITH !
          </p>

          <p className="pt-7">
            FOR INQUIRIES, CLICK&nbsp;
            <a
              href="mailto:goodluckwhiterabbit@gmail.com"
              className="border border-solid border-red xl:hover:border-mag p-1 xl:transition-all drop-shadow-[2px_2px_2px_rgba(255,115,255,1)] xl:hover:drop-shadow-[2px_2px_2px_rgba(220,38,38,1)]"
            >
              HERE
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
