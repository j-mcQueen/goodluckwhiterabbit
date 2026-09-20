import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import rabbit from "../../assets/media/gifs/glwr-lenticular.gif";
import ThisWayUp from "../../assets/media/icons/ThisWayUp";
import Fork from "./Fork";

export default function Welcome() {
  const location = useLocation();
  const forkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // rabbit gif in the portfolio header links back here with this flag so
    // returning visitors land straight on the category picker, not the intro
    if ((location.state as { toSegments?: boolean } | null)?.toSegments) {
      forkRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [location.state]);

  return (
    <main className="w-[calc(100dvw-var(--frame))] h-[calc(100dvh-var(--frame))] overflow-y-scroll snap-y snap-mandatory">
      <section className="flex flex-col items-center justify-between h-[calc(100dvh-var(--frame))] py-10 snap-start snap-always">
        <img
          className="max-w-[300px]"
          src={rabbit}
          alt="A white rabbit against a black background shimmering from left to right"
        />

        <div className="text-xl text-white text-center tracking-vt">
          <p className="pb-5">
            THE WORK AND ARCHIVE OF NYC-BASED ARTIST, PHOTOGRAPHER, AND DESIGNER
            KAI McQUEEN.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 1 } }}
            className="max-xl:pb-[4.5rem]"
          >
            AN INQUIRY INTO WHAT IS, <br className="xl:hidden" />
            EVER IN PURSUIT OF PURPOSE AND BALANCE.
          </motion.p>
        </div>

        <ThisWayUp className="w-7 h-7 opacity-80 drop-shadow-glo" />
      </section>

      {/* only visible mid-scroll, between the two snap points - clipped out
          of view at rest on either side, so it never doubles up against
          #root's own frame border once Fork fills the screen */}
      <div className="h-px bg-white" />

      {/* below xl Fork's own pages are the snap points - a snap area taller
          than the viewport would let scrolling settle anywhere inside it */}
      <div ref={forkRef} className="xl:snap-start xl:snap-always">
        <Fork />
      </div>
    </main>
  );
}
