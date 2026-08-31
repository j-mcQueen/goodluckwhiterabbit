export const calcNextStart = (
  activeGroupId: string,
  result: { blob: Blob; group: string }[],
  prevStart: number,
) => {
  // prime state for next use
  let counter = prevStart;
  let latestGroupId = activeGroupId;
  for (const obj of result) {
    // reset counter if we have moved to another group
    if (latestGroupId !== obj.group) {
      counter = 1;
      latestGroupId = obj.group;
    } else counter++;
  }
  return counter;
};
