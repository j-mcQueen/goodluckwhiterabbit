// import { useState } from "react";
import { art_data } from "../../../assets/media/images/art/art_data";
import { motion } from "framer-motion";

export default function Content() {
  // const [statement, setStatement] = useState(true);

  const img_variants = {
    initial: {
      y: 25,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.15,
      },
    },
  };

  const list_variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 1, staggerChildren: 0.5 },
    },
  };

  const statement_variants = {
    initial: { opacity: 0 },
    animate: (j: number) => ({
      opacity: 1,
      transition: { duration: 1, delay: j * 2 },
    }),
  };

  const statement = [
    "Experience the here and now; revel in what is ~",
    "Observe the continuum in shifting constants, find freedom in fleeting chance,",
    "Reflect on the endless possibilities that exist...",
    "This way up.",
  ];

  // WHEN PAGE RENDERS, LOAD STATEMENT -> USE STATE TO CONTROL THIS
  // EXECUTE ANIMATIONS, THEN AFTER FULL ANIMATION COMPLETES,
  // FADE OUT STATEMENT AND REMOVE FROM DOM, USE STATE TO TRIGGER ARTWORK APPEARANCES
  // PLAY SOUND, FADE UP FIRST ARTWORK

  return (
    <section className="flex justify-center">
      <div
        style={{ scrollbarWidth: "none" }}
        className="grid grid-cols-1 grid-rows-full gap-10 items-center justify-center overflow-y-scroll xl:h-[calc(100dvh-1.5rem-5dvw)] h-[calc(100dvh-1.5rem-25dvw)] snap-y snap-mandatory"
      >
        {art_data.map((item, index: number) => {
          return index === 0 ? (
            <div
              key="statement"
              className="flex flex-col items-center justify-center gap-10 snap-start xl:h-[calc(100dvh-1.5rem-5dvw)] h-[calc(100dvh-1.5rem-25dvw)] text-white font-tnrI tracking-wide text-sm xl:text-2xl xl:text-center px-7"
            >
              {statement.map((line, j) => {
                return (
                  <motion.div
                    key={line}
                    custom={j}
                    variants={statement_variants}
                    initial={"initial"}
                    animate={"animate"}
                    className="flex whitespace-pre"
                  >
                    <p>{line}</p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              key={item.title}
              className="flex flex-col justify-center items-center text-white snap-start xl:h-[calc(100dvh-1.5rem-5dvw)] h-[calc(100dvh-1.5rem-25dvw)]"
            >
              <motion.img
                variants={img_variants}
                initial="initial"
                whileInView={"animate"}
                loading="lazy"
                src={item.src}
                alt={item.title}
                className={`${index > 7 ? "xl:max-h-[35dvh]" : "xl:max-h-[60dvh]"} xl:max-w-[45dvw] max-w-[90dvw] max-h-[50dvh]`}
              />

              <motion.ul
                variants={list_variants}
                initial="initial"
                whileInView="animate"
                className="flex flex-col justify-center gap-1 pt-5 xl:pt-10 text-center tetx-md xl:text-lg"
              >
                <li>
                  <span className="italic">{item.title},&nbsp;</span>
                  {item.date}
                </li>

                <li>{item.medium}</li>

                <li>{item.dims}</li>

                <li>{item.signed ? "Signed" : "Unsigned"}</li>

                <li>
                  {item.edition === 1 ? "Unique" : `Edition of ${item.edition}`}
                </li>

                <li
                  className={`${item.available ? "pt-4" : ""} font-vt tracking-wider`}
                >
                  {item.available ? (
                    <a
                      href="mailto:goodluckwhiterabbit@gmail.com"
                      className="border border-solid border-white px-2 py-1 xl:hover:text-rd xl:focus:text-rd group xl:transition-colors xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:hover:border-rd xl:focus:border-rd drop-shadow-glo opacity-80"
                    >
                      INQUIRE
                    </a>
                  ) : (
                    <div className="drop-shadow-red text-rd pt-4">
                      <p>~ COLLECTED ~</p>
                    </div>
                  )}
                </li>
              </motion.ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
