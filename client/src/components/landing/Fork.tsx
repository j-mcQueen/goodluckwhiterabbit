import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { landing_mdata as mdata } from "../../assets/media/images/landing/landing_mdata";
import { determineHost as host } from "../global/utils/determineHost";
import { DISABLED_CATEGORY_ROUTES } from "../portfolio/disabledCategories";
import { PortfolioSidebarData } from "../portfolio/types/PortfolioSidebarData";
import ContactDialog from "../portfolio/ContactDialog";
import Contact from "./Contact";
import Segment from "./Segment";

const TILES_PER_PAGE = 2;
// category <-> subcategory: fade the tiles out, swap the layout while nothing
// is visible, fade back in (no size animation, so images never stretch)
const FADE_SECONDS = 0.4;

export default function Fork() {
  const [taxonomy, setTaxonomy] = useState<PortfolioSidebarData>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  const changeSelected = (next: number | null) => {
    if (fading) return;
    setFading(true);
    fadeTimer.current = window.setTimeout(() => {
      setSelected(next);
      setFading(false);
    }, FADE_SECONDS * 1000);
  };

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const response = await fetch(`${host}/portfolio/taxonomy`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (response.status === 200) {
          setTaxonomy(await response.json());
        }
      } catch (error) {
        // leave taxonomy at its empty default - segments render without a
        // subcategory picker rather than crashing
      }
    };

    fetchTaxonomy();
  }, []);

  // only the selected segment stays mounted once one is chosen, so it alone
  // divides the section height (i.e. fills it)
  const visible =
    selected === null
      ? mdata.map((a, i) => ({ ...a, i }))
      : [{ ...mdata[selected], i: selected }];

  // mobile stacks tiles two per screen-height page, each page its own scroll
  // snap point (room under the last page's lone tile is reserved for future
  // contact info); xl: flattens the pages away (display: contents) so the
  // tiles form one row. Pages are keyed by each tile's ORIGINAL index so a
  // selected tile keeps its parent (no remount) when the rest unmount.
  const pages = visible.reduce<{ page: number; tiles: typeof visible }[]>(
    (acc, a) => {
      const page = Math.floor(a.i / TILES_PER_PAGE);
      const existing = acc.find((p) => p.page === page);
      if (existing) existing.tiles.push(a);
      else acc.push({ page, tiles: [a] });
      return acc;
    },
    [],
  );

  return (
    <motion.section
      initial={false}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: FADE_SECONDS }}
      className="flex flex-col xl:flex-row w-full xl:h-[calc(100dvh-var(--frame))]"
    >
      <AnimatePresence>
        {pages.map(({ page, tiles }) => (
          <div
            key={page}
            className="flex flex-col h-[calc(100dvh-var(--frame))] snap-start snap-always xl:contents"
          >
            {tiles.map((a, posInPage) => {
              const pos = visible.findIndex((v) => v.i === a.i);
              const available =
                !DISABLED_CATEGORY_ROUTES.includes(a.path) &&
                (taxonomy[a.path]?.subcategories.length ?? 0) > 0;

              return (
                <Segment
                  alt={a.alt}
                  available={available}
                  isFirst={pos === 0}
                  isFirstInPage={posInPage === 0}
                  isLast={pos === visible.length - 1}
                  // bare bottom edge only where the tile's bottom actually
                  // meets the frame: a full page, or a selected tile filling
                  // it. A lone tile with room beneath (reserved for contact
                  // info) keeps its bottom border.
                  isLastInPage={
                    posInPage === tiles.length - 1 &&
                    (tiles.length === TILES_PER_PAGE || selected !== null)
                  }
                  key={`${a.alt}-${selected === a.i}`}
                  onDeselect={() => changeSelected(null)}
                  onSelect={() => changeSelected(a.i)}
                  path={a.path}
                  selected={selected === a.i}
                  source={a.source}
                  subSource={a.subSource}
                  subcategories={taxonomy[a.path]?.subcategories ?? []}
                  text={a.text}
                />
              );
            })}

            {/* the last page's spare half (mobile only - Contact hides itself
                at xl:) holds contact info, but only while the tiles are all
                showing: a selected tile fills the page instead */}
            {selected === null &&
              tiles.length < TILES_PER_PAGE &&
              page === pages[pages.length - 1].page && (
                <Contact setContactOpen={setContactOpen} />
              )}
          </div>
        ))}
      </AnimatePresence>

      <ContactDialog
        contactOpen={contactOpen}
        setContactOpen={setContactOpen}
      />
    </motion.section>
  );
}
