import { useEffect, useRef } from "react";

// Renders a memo's stored markup exactly as-is via dangerouslySetInnerHTML
// - this is the one thing both the admin queue and the public site call,
// on the same html string, which is what makes them WYSIWYG by
// construction rather than by keeping two render implementations in sync.
//
// Injected markup is inert to React's synthetic event system, so the
// Inquire button (data-field="inquire") needs a native listener attached
// after injection - the same technique PortfolioOrderItem.tsx already uses
// for its native dragstart listener, for the same underlying reason.
export default function MemoDisplay({
  html,
  onInquire,
  className,
}: {
  html: string;
  onInquire?: () => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !onInquire) return;

    const button = node.querySelector('[data-field="inquire"]');
    if (!button) return;

    const handleClick = () => onInquire();
    button.addEventListener("click", handleClick);
    return () => button.removeEventListener("click", handleClick);
  }, [html, onInquire]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
