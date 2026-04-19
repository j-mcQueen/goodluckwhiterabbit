export const calcNextStart = (
  activeGroup: number,
  result: { blob: Blob; group: string }[],
  prevStart: number,
) => {
  // prime state for next use
  let counter = prevStart;
  let latestGroup = activeGroup;
  for (const obj of result) {
    const group = Number(obj.group);

    // reset counter if we have moved to another group
    if (latestGroup !== group) {
      counter = 1;
      latestGroup++;
    } else counter++;
  }
  return counter;
};
