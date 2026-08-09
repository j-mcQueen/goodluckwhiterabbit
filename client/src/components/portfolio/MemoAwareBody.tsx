import { CSSProperties, useEffect, useState } from "react";
import { mobile } from "../global/utils/determineViewport";
import { fetchFullPortfolioLayout } from "../global/memo/fetchFullPortfolioLayout";
import {
  splitPortfolioLayoutIntoSegments,
  PortfolioLayoutSegment,
} from "../global/utils/splitPortfolioLayoutIntoSegments";
import MemoDisplay from "../global/memo/MemoDisplay";
import WidowMemoPair from "../global/memo/WidowMemoPair";

// Rendering path for a memo-managed group only (Body.tsx branches into this
// per spec §2.1 - zero-memo groups never reach this component). Segmented
// grid blocks per run, explicit grid-row/grid-column placement from the
// packing simulation rather than grid-auto-flow: dense, and widow rows
// co-centered with their following memo - see splitPortfolioLayoutIntoSegments.ts
// and packPortfolioRun.ts for why.
const GRID_CLASSES =
  "grid grid-cols-1 gap-2 px-2 xl:auto-rows-[39vw] xl:[grid-template-columns:repeat(3,minmax(320px,1fr))]";

export default function MemoAwareBody({
  category,
  sub,
  groupId,
  setContactOpen,
}: {
  category: string;
  sub: string;
  groupId: string;
  setContactOpen: (open: boolean) => void;
}) {
  const [segments, setSegments] = useState<PortfolioLayoutSegment[] | null>(null);
  const [urlsByKey, setUrlsByKey] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    let objectUrls: string[] = [];

    setSegments(null);
    fetchFullPortfolioLayout(category, sub, groupId, mobile ? "sm" : "lg").then(
      ({ entries, blobsByKey }) => {
        if (cancelled) return;

        const nextUrls = new Map<string, string>();
        blobsByKey.forEach((blob, key) => nextUrls.set(key, URL.createObjectURL(blob)));
        objectUrls = [...nextUrls.values()];

        setUrlsByKey(nextUrls);
        setSegments(splitPortfolioLayoutIntoSegments(entries));
      },
    );

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [category, sub, groupId]);

  const renderImage = (key: string) => {
    const url = urlsByKey.get(key);
    if (!url) return null;
    return <img src={url} alt="" className="block w-full h-full object-cover" loading="lazy" />;
  };

  if (!segments) {
    return (
      <div className="flex items-center justify-center h-full text-white/70 font-vt tracking-vt text-sm">
        LOADING...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {segments.map((segment, index) => {
        if (segment.kind === "memo") {
          if (segment.pairedWidowImages.length > 0) {
            return (
              <WidowMemoPair
                key={`memo-${segment.memoId}`}
                widowImages={segment.pairedWidowImages}
                renderImage={renderImage}
                html={segment.html}
                onInquire={() => setContactOpen(true)}
              />
            );
          }
          return (
            <MemoDisplay
              key={`memo-${segment.memoId}`}
              html={segment.html}
              onInquire={() => setContactOpen(true)}
            />
          );
        }

        if (mobile) {
          return (
            <div key={`run-${index}`} className="flex flex-col gap-2 px-2">
              {segment.images.map((image) => (
                <div key={image.key} className="w-full aspect-[4/3] overflow-hidden">
                  {renderImage(image.key)}
                </div>
              ))}
            </div>
          );
        }

        return (
          <div key={`run-${index}`} className={GRID_CLASSES}>
            {segment.packing.placements.map((placement) => {
              const style: CSSProperties = {
                gridColumn: `${placement.column} / span ${placement.columnSpan}`,
                gridRow: `${placement.row} / span 1`,
              };
              return (
                <div key={placement.key} className="overflow-hidden hidden xl:block" style={style}>
                  {renderImage(placement.key)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
