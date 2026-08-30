import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { landing_mdata as mdata } from "../../assets/media/images/landing/landing_mdata";
import { determineHost as host } from "../global/utils/determineHost";
import { DISABLED_CATEGORY_ROUTES } from "../portfolio/disabledCategories";
import { PortfolioSidebarData } from "../portfolio/types/PortfolioSidebarData";
import Segment from "./Segment";

export default function Fork() {
  const [taxonomy, setTaxonomy] = useState<PortfolioSidebarData>({});
  const [selected, setSelected] = useState<number | null>(null);

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

  return (
    <section className="flex flex-col xl:flex-row w-full h-[calc(100dvh-var(--frame))]">
      <AnimatePresence>
        {visible.map((a, pos) => {
          const available =
            !DISABLED_CATEGORY_ROUTES.includes(a.path) &&
            (taxonomy[a.path]?.subcategories.length ?? 0) > 0;

          return (
            <Segment
              alt={a.alt}
              available={available}
              isFirst={pos === 0}
              isLast={pos === visible.length - 1}
              key={a.alt}
              onDeselect={() => setSelected(null)}
              onSelect={() => setSelected(a.i)}
              path={a.path}
              selected={selected === a.i}
              source={a.source}
              subcategories={taxonomy[a.path]?.subcategories ?? []}
              text={a.text}
            />
          );
        })}
      </AnimatePresence>
    </section>
  );
}
