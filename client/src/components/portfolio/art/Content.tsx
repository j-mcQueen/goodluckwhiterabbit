import { art_data } from "../../../assets/media/images/art/art_data";
import { motion } from "framer-motion";
import ArtItem from "./ArtItem";

export default function Content() {
  const statement_variants = {
    initial: { opacity: 0 },
    animate: (j: number) => ({
      opacity: 1,
      transition: { duration: 1, delay: j * 2 },
    }),
  };

  const statement = [
    "Experience the here and now; revel in what is ~",
    "Observe the continuum in shifting constants,",
    "Find freedom in fleeting chance,",
    "This way up.",
  ];

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
            <ArtItem key={item.title} index={index} item={item} />
          );
        })}
      </div>
    </section>
  );
}
