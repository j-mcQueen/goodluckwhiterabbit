import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export default function ArtItem({ ...props }) {
  const { index, item } = props;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  const imgControls = useAnimation();
  const listControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      await imgControls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 1.15 },
      });

      await listControls.start({
        opacity: 1,
        transition: {
          duration: 1,
          staggerChildren: 0.5,
        },
      });
    };

    if (isInView) sequence();
  }, [isInView, imgControls, listControls]);

  return (
    <div
      key={item.title}
      ref={ref}
      className="flex flex-col justify-center items-center text-white snap-start xl:h-[calc(100dvh-1.5rem-5dvw)] h-[calc(100dvh-1.5rem-25dvw)]"
    >
      <motion.img
        initial={{ y: 25, opacity: 0 }}
        animate={imgControls}
        src={item.src}
        alt={item.title}
        className={`${index > 7 ? "xl:max-h-[35dvh]" : "xl:max-h-[60dvh]"} xl:max-w-[45dvw] max-w-[90dvw] max-h-[50dvh]`}
      />

      <motion.ul
        initial={{ opacity: 0 }}
        animate={listControls}
        className="flex flex-col justify-center gap-1 pt-5 xl:pt-3 text-center tetx-md xl:text-lg"
      >
        <li>
          <span className="italic">{item.title},&nbsp;</span>
          {item.date}
        </li>

        <li>{item.medium}</li>

        <li>{item.dims}</li>

        <li>{item.signed ? "Signed" : "Unsigned"}</li>

        <li>{item.edition === 1 ? "Unique" : `Edition of ${item.edition}`}</li>

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
}
