import { art_data } from "../../../assets/media/images/art/art_data";
import { motion } from "framer-motion";

export default function Content() {
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
    animate: { opacity: 1, transition: { duration: 1, delay: 0.5 } },
  };

  const statement_variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1 } },
  };

  return (
    <section className="flex justify-center">
      <div
        style={{ scrollbarWidth: "none" }}
        className="grid grid-cols-1 grid-rows-full gap-10 items-center justify-center overflow-y-scroll xl:h-[calc(100dvh-1.5rem-5dvw)] h-[calc(100dvh-1.5rem-25dvw)] snap-y snap-mandatory"
      >
        {art_data.map((item, index: number) => {
          return index === 0 ? (
            <motion.div
              key="statement"
              variants={statement_variants}
              initial={"initial"}
              whileInView={"animate"}
              className="flex items-center justify-center snap-start xl:h-[calc(100dvh-1.5rem-5dvw)] h-[calc(100dvh-1.5rem-25dvw)] text-white text-center"
            >
              <div className="font-tnrI tracking-wide text-sm xl:text-2xl text-justify xl:text-center px-7">
                <p>Experience the here and now; revel in what is ~</p>

                <p className="py-5 xl:py-10">
                  Observe the continuum of shifting constants, find freedom in
                  fleeting chance,
                </p>

                <p>Reflect on the endless possibilities that exist...</p>

                <p className="py-5 xl:pt-10">This way up.</p>
              </div>
            </motion.div>
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
                  className={`${item.available ? "pt-4" : ""} font-tnrI tracking-wider`}
                >
                  {item.available ? (
                    <a
                      href="mailto:goodluckwhiterabbit@gmail.com"
                      className="font-tnrI border border-solid border-white px-2 py-1 pt-2 xl:hover:text-rd xl:focus:text-rd group xl:transition-colors text-sm xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:hover:border-rd xl:focus:border-rd "
                    >
                      INQUIRE
                    </a>
                  ) : (
                    <div className="drop-shadow-red text-rd text-sm pt-4">
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
