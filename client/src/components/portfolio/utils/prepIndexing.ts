export const prepIndexing = ({ ...params }) => {
  const { entries, thresholds } = params;

  let counter = 0;
  const newBlobs = [];
  const newThresholds = [...thresholds];

  for (const [key, value] of entries) {
    const group = Number(key) - 1;
    counter += value.length;

    if (group in newThresholds) {
      if (value.length > newThresholds[group])
        newThresholds[group] = value.length;
    } else {
      newThresholds.push(value.length);
    }

    newBlobs.push(...value);
  }

  return { counter, newBlobs, newThresholds };
};
