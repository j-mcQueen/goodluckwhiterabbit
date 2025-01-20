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

  return (
    <section className="flex justify-center">
      <div
        style={{ scrollbarWidth: "none" }}
        className="grid grid-cols-1 grid-rows-full gap-10 items-center justify-center overflow-y-scroll h-[calc(100dvh-1.5rem-114px)] snap-y snap-mandatory"
      >
        {art_data.map((item, index: number) => {
          return (
            <div
              key={item.title}
              className="flex flex-col justify-center items-center text-white snap-start h-[calc(100dvh-1.5rem-114px)]"
            >
              <motion.img
                variants={img_variants}
                initial="initial"
                whileInView={"animate"}
                loading="lazy"
                src={item.src}
                alt={item.title}
                className={`${index > 6 ? "xl:max-h-[35dvh]" : "xl:max-h-[60dvh]"} xl:max-w-[45dvw] max-w-[90dvw]`}
              />

              <motion.ul
                variants={list_variants}
                initial="initial"
                whileInView="animate"
                className="flex flex-col justify-center gap-1 pt-10 text-center text-lg"
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

                <li className={`${item.available ? "pt-4" : ""}`}>
                  {item.available ? (
                    <a
                      href="mailto:goodluckwhiterabbit@gmail.com"
                      className="border border-solid border-white px-2 py-1 xl:hover:text-rd xl:focus:text-rd group xl:transition-colors drop-shadow-glo xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:hover:border-rd xl:focus:border-rd opacity-80"
                    >
                      INQUIRE
                    </a>
                  ) : (
                    <div className="drop-shadow-red text-rd opacity-80 pt-4">
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
