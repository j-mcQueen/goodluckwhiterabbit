import rabbit from "../../assets/media/gifs/glwr-lenticular.gif";

export default function UnderConstruction() {
  return (
    <main className="w-[calc(100dvw-1.5rem)] h-[calc(100dvh-1.5rem)] flex flex-col overflow-y-scroll">
      <section className="flex flex-col justify-between items-center h-full">
        <img
          className="block top-[calc(0px+1.5rem)] xl:max-w-[600px] max-w-[300px]"
          src={rabbit}
          alt="A white rabbit against a black background shimmering from left to right"
        />

        <h1 className="text-white py-6 xl:py-10 text-xl xl:text-5xl tracking-widest italic text-center xl:-translate-y-[125px] -translate-y-[75px] xl:px-0 z-10">
          WELCOME TO MY WORLD
        </h1>

        <p className="font-inter font-bold text-[14px] xl:text-[16px] text-white leading-6 text-center px-3 xl:px-0 pb-10">
          A NEW DIGITAL EXPERIENCE IS ON THE WAY... FOR INQUIRIES, PLEASE SEND
          AN&nbsp;
          <a
            href="mailto:goodluckwhiterabbit@gmail.com"
            className="text-red-600 xl:hover:underline"
          >
            E-MAIL
          </a>
          .
        </p>

        {/* <hgroup className="flex flex-col items-center justify-center">
        </hgroup> */}
      </section>
    </main>
  );
}
