import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Rewind from "../../assets/media/icons/Rewind";

const BACK_BUTTON_CLASSES =
  "w-10 h-10 xl:w-8 xl:h-8 border border-solid border-white bg-black/50 xl:hover:bg-black/70 transition-colors flex items-center justify-center xl:hover:cursor-pointer";

export default function Segment({ ...props }) {
  const {
    alt,
    available,
    bleedBottom,
    isFirst,
    isFirstInPage,
    isLast,
    isLastInPage,
    onDeselect,
    onSelect,
    path,
    selected,
    source,
    subSource,
    subcategories,
    text,
  } = props;

  const navigate = useNavigate();
  const [exitSubIndex, setExitSubIndex] = useState<number | null>(null);
  // gates hover-reveal and clicks on the tiles below until the entering
  // chrome (label or subcategory list) has actually finished fading in -
  // otherwise a click while the mouse already sits over a tile fires the
  // hover-reveal (or a selection) before the content has visually caught up
  const [chromeReady, setChromeReady] = useState(false);
  // AnimatePresence's mode="wait" can interrupt an in-flight enter
  // animation (redirecting it into exit) without necessarily cancelling
  // its already-scheduled onAnimationComplete - a stale completion from
  // the branch that's no longer showing must not be allowed to mark
  // chromeReady true. A ref (not the closure's own captured `selected`)
  // is what lets that check see the CURRENT value at fire time.
  const selectedRef = useRef(selected);

  useEffect(() => {
    selectedRef.current = selected;
    setChromeReady(false);
  }, [selected]);

  const segmentVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const handleSubcategoryClick = (index: number) => {
    setExitSubIndex(index);
  };

  // mobile stacks segments in a column, two per screen-height page (dividers
  // on top/bottom, each page's outer top/bottom edges bare); xl: restores the
  // row layout (dividers on left/right, outer left/right edges bare)
  const segmentBorderClasses = `border-l-0 border-r-0 -my-[0.5px] xl:my-0 xl:-mx-[0.5px] xl:border-t-0 xl:border-b-0 ${
    isFirstInPage ? "border-t-0" : ""
  } ${isFirst ? "xl:border-l-0" : "xl:border-l"} ${
    isLastInPage ? "border-b-0" : ""
  } ${isLast ? "xl:border-r-0" : "xl:border-r"}`;

  return (
    <motion.div
      variants={segmentVariants}
      initial="hidden"
      animate={exitSubIndex === null ? "visible" : "hidden"}
      onAnimationComplete={(definition) => {
        if (definition === "hidden" && exitSubIndex !== null) {
          navigate(path, {
            state: { subIndex: exitSubIndex, playSoundOnLoad: true },
          });
        }
      }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-none xl:flex-1 xl:h-full ${selected ? "h-full" : bleedBottom ? "h-[calc(50%+2.5px)] max-xl:z-10" : "h-1/2"} items-center justify-center border border-white border-solid overflow-hidden ${segmentBorderClasses}`}
    >
      {/* primary-level image sits underneath; the subcategory-level image
          crossfades in over it (same 500ms as the rest of the chrome) once a
          segment is selected. Both share one opacity-70 wrapper so the
          crossfade never dips or lets the lower image bleed through. */}
      <div className="relative h-dvh w-full opacity-70">
        <img
          src={source}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <img
          src={subSource}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${selected ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* click/hover target and the image covering, merged into one layer
          that never itself fades - only its own hover-driven opacity does.
          Keeping this decoupled from the label/subcategory chrome below
          (which DOES crossfade) means that crossfade can never let the
          background image flash through mid-transition. */}
      <div className="absolute inset-0 flex flex-col xl:flex-row">
        {(selected ? subcategories : [text]).map((label: string, i: number) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            disabled={!chromeReady || (!selected && !available)}
            onClick={() => (selected ? handleSubcategoryClick(i) : onSelect())}
            className={`flex-1 w-full xl:w-auto xl:h-full bg-black transition-opacity duration-500 opacity-0 xl:opacity-100 ${!chromeReady || (!selected && !available) ? "cursor-default" : ""} ${chromeReady && (selected || available) ? "xl:hover:opacity-0" : ""}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.button
            key="back"
            type="button"
            aria-label="Back to categories"
            onClick={onDeselect}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-2 left-2 z-50 ${BACK_BUTTON_CLASSES}`}
          >
            <Rewind className="w-4 h-4 opacity-80" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* purely decorative labeling, layered above the click/hover target -
          this is what crossfades between the primary label and the
          subcategory list */}
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
              if (!selectedRef.current) setChromeReady(true);
            }}
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <h2
              className={`font-tnrBI drop-shadow-glo text-white text-center text-2xl ${available ? "" : "opacity-40"}`}
            >
              {text}
            </h2>
          </motion.div>
        ) : (
          <motion.ul
            key="subcategories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
              if (selectedRef.current) setChromeReady(true);
            }}
            aria-hidden="true"
            className="absolute inset-0 flex flex-col xl:flex-row pointer-events-none"
          >
            {subcategories.map((sub: string, i: number) => {
              const isFirstSub = i === 0;
              const isLastSub = i === subcategories.length - 1;
              const subBorderClasses = `border-l-0 border-r-0 -my-[0.5px] xl:my-0 xl:-mx-[0.5px] xl:border-t-0 xl:border-b-0 ${
                isFirstSub ? "border-t-0 xl:border-l-0" : "xl:border-l"
              } ${isLastSub ? "border-b-0 xl:border-r-0" : "xl:border-r"}`;

              return (
                <li
                  key={sub}
                  className={`flex-1 flex items-center justify-center border border-white border-solid ${subBorderClasses}`}
                >
                  <span className="font-tnrBI drop-shadow-glo text-white/80 text-2xl tracking-vt">
                    {sub}
                  </span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
