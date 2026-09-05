import { ReactNode } from "react";

// The centered-flex-row half of WidowMemoPair, pulled out so a widow row
// can be centered on its own - without a memo alongside it - in two more
// places: a plain (memo-less) block whose trailing row precedes the next
// group's memo block, and a memo-managed group's own absolute final run
// when it's followed by another memo group. Both are cross-group cases
// where the pairing memo lives in a separate block entirely, so there's
// nothing to render here but the images themselves, still centered on the
// same axis WidowMemoPair already uses.
//
// className defaults to WidowMemoPair's original always-row styling
// (unaffected by anything below) - the two newer callers above pass their
// own responsive override instead, since they need to stack full-width
// below the xl breakpoint (matching the grid's own grid-cols-1 base)
// rather than staying a small row at every size.
export default function WidowImagesRow({
  children,
  className = "flex justify-center gap-2 w-full px-2",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
