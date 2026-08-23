import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { mobile } from "../user/dashboard/utils/determineViewport";
import Rewind from "../../assets/media/icons/Rewind";

const BACK_BUTTON_CLASSES =
  "w-8 h-8 rounded-full border border-dashed border-white/40 bg-black/50 xl:hover:border-white/70 xl:hover:bg-black/70 transition-colors flex items-center justify-center xl:hover:cursor-pointer";

export default function Segment({ ...props }) {
  const {
    alt,
    available,
    isFirst,
    isLast,
    onDeselect,
    onSelect,
    path,
    selected,
    source,
    subcategories,
    text,
  } = props;

  const navigate = useNavigate();
  const [exitSubIndex, setExitSubIndex] = useState<number | null>(null);
  const [backExiting, setBackExiting] = useState(false);
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

  const dims = {
    m: "w-dvw opacity-70",
    d: "h-dvh opacity-70",
  };

  const segmentVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const handleSubcategoryClick = (index: number) => {
    setExitSubIndex(index);
  };

  const handleBackClick = () => {
    setBackExiting(true);
  };

  return (
    <motion.div
      layout
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
      className={`relative flex flex-1 h-full items-center justify-center border border-white border-solid overflow-hidden -mx-[0.5px] border-t-0 border-b-0 ${isFirst ? "border-l-0" : ""} ${isLast ? "border-r-0" : ""}`}
    >
      <img
        src={source}
        alt={alt}
        className={`${mobile ? dims.m : dims.d} object-cover w-full h-full`}
      />

      {/* click/hover target and the image covering, merged into one layer
          that never itself fades - only its own hover-driven opacity does.
          Keeping this decoupled from the label/subcategory chrome below
          (which DOES crossfade) means that crossfade can never let the
          background image flash through mid-transition. */}
      <div className="absolute inset-0 flex flex-row">
        {(selected ? subcategories : [text]).map(
          (label: string, i: number) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              disabled={!chromeReady || (!selected && !available)}
              onClick={() =>
                selected ? handleSubcategoryClick(i) : onSelect()
              }
              className={`flex-1 h-full bg-black transition-opacity duration-500 ${!chromeReady || (!selected && !available) ? "cursor-default" : ""} ${
                selected && chromeReady
                  ? mobile
                    ? "opacity-0"
                    : "opacity-100 xl:hover:opacity-0"
                  : "opacity-100"
              }`}
            />
          ),
        )}
      </div>

      <AnimatePresence
        onExitComplete={() => {
          if (backExiting) {
            onDeselect();
            setBackExiting(false);
          }
        }}
      >
        {selected && !backExiting && (
          <motion.button
            key="back"
            type="button"
            aria-label="Back to categories"
            onClick={handleBackClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-4 left-4 z-50 ${BACK_BUTTON_CLASSES}`}
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
            className="absolute inset-0 flex flex-row pointer-events-none"
          >
            {subcategories.map((sub: string, i: number) => (
              <li
                key={sub}
                className={`flex-1 flex items-center justify-center border border-white border-solid -mx-[0.5px] border-t-0 border-b-0 ${i === 0 ? "border-l-0" : ""} ${i === subcategories.length - 1 ? "border-r-0" : ""}`}
              >
                <span className="font-tnrBI drop-shadow-glo text-white/80 text-2xl tracking-vt">
                  {sub}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
