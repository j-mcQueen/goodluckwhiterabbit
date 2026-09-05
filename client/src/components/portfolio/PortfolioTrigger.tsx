import { InView } from "react-intersection-observer";
import { CSSProperties, ReactNode } from "react";

// Drop-in replacement for whichever plain <div> would otherwise be the
// true last rendered grid item across the whole `blocks` sequence (see
// Body.tsx) - renders as exactly one element (no wrapper nesting, so grid
// item classes like col-span still apply directly), firing onTrigger on
// entering view. Deliberately does NOT skip an already-fully-visible
// (intersectionRatio === 1) transition the way Unit.tsx originally did -
// that guard couldn't tell "just mounted, already visible" apart from a
// genuine scroll landing exactly on full visibility (common with a short
// last row, or a large scroll delta), and silently stalled pagination.
// Body.tsx's isFetchingRef guard already makes an extra/early fire here
// perfectly safe, so there's nothing left for that check to protect.
export default function PortfolioTrigger({
  as = "div",
  className,
  style,
  onTrigger,
  children,
}: {
  as?: "div";
  className?: string;
  style?: CSSProperties;
  onTrigger: () => void | Promise<void>;
  children: ReactNode;
}) {
  return (
    <InView
      as={as}
      className={className}
      style={style}
      onChange={(inView) => {
        if (!inView) return;
        onTrigger();
      }}
    >
      {children}
    </InView>
  );
}
