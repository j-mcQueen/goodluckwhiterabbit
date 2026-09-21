import { InView } from "react-intersection-observer";

// Memo-aware blocks render their images as plain <img>s (no Unit), so nothing
// in them reports which group has scrolled into view - and that report is
// what drives the sidebar/nav highlight (Portfolio.tsx derives the highlighted
// index from activeGroupId). This 1px marker at the top of such a block does
// that job; the negative margin cancels its height so layout is unaffected.
export default function GroupSentinel({
  groupId,
  activeGroupId,
  setActiveGroupId,
}: {
  groupId: string;
  activeGroupId?: string;
  setActiveGroupId: (groupId: string) => void;
}) {
  return (
    <InView
      as="div"
      className="h-px -mb-px w-full"
      onChange={(inView) => {
        if (inView && groupId !== activeGroupId) setActiveGroupId(groupId);
      }}
    />
  );
}
