import { ReactNode } from "react";
import MemoDisplay from "./MemoDisplay";

// Renders a run's trailing widow row (1-2 images that don't fill all 3
// grid columns) together with the memo that follows it, both centered on
// one shared horizontal axis by construction (a single flex column), not
// by coincidence of grid math - see spec §2.1 for why this can't just be
// centering the images within their own grid row.
export default function WidowMemoPair({
  widowImages,
  renderImage,
  html,
  onInquire,
}: {
  widowImages: { key: string; columnSpan: 1 | 2 }[];
  renderImage: (key: string) => ReactNode;
  html: string;
  onInquire?: () => void;
}) {
  return (
    <div className="flex flex-col items-center w-full gap-2">
      <div className="flex justify-center gap-2 w-full px-2">
        {widowImages.map((image) => (
          <div
            key={image.key}
            className={`aspect-[4/3] overflow-hidden ${image.columnSpan === 2 ? "w-full max-w-[440px]" : "w-full max-w-[280px]"}`}
          >
            {renderImage(image.key)}
          </div>
        ))}
      </div>
      <MemoDisplay html={html} onInquire={onInquire} />
    </div>
  );
}
