export const testActiveGroup = ({ ...params }) => {
  const { activeGroup, currentIndex, setActiveGroup, thresholds } = params;
  const prevGroup = activeGroup - 1;

  if (currentIndex > thresholds[activeGroup])
    return setActiveGroup((prev: number) => prev + 1);

  if (activeGroup !== 1) {
    if (currentIndex <= thresholds[prevGroup]) {
      // use boundary of previous group to protect against premature  repeated decrementation
      return setActiveGroup((prev: number) => prev - 1);
    }
  } else return; // can't decrement activeGroup if at boundary
};
