import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

// mirrors the listing/regex/sort adminGetPortfolioGroupImages already uses
// to derive display order live from S3 - this is the one ground-truth
// source for a group's image order, used by the one-time layout migration
// and by the layout self-heal check on every admin queue load.
const positionRegex = /_(\d{1,3})\.[^.]+$/;

export const derivePortfolioImagePositionsFromS3 = async (category, sub, groupId) => {
  const groupPrefix = `${category}/${sub}/${groupId}/`;

  const listed = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.AWS_SECONDARY_BUCKET,
      Prefix: groupPrefix,
    }),
  );

  const matches = (listed.Contents ?? []).filter(
    (obj) => obj.Key.includes("/sm/") && obj.Size > 0,
  );

  const positions = new Set();
  for (const obj of matches) {
    const match = obj.Key.match(positionRegex);
    if (match) positions.add(Number(match[1]));
  }

  return [...positions].sort((a, b) => a - b);
};

export const derivePortfolioLayoutFromS3 = async (category, sub, groupId) => {
  const positions = await derivePortfolioImagePositionsFromS3(category, sub, groupId);
  return positions.map((position) => ({ type: "image", position }));
};

// self-heal merge: repairs the image entries in an existing layout against
// ground-truth S3 positions, without disturbing memo entries or their
// relative order. Drops image entries whose position no longer exists in
// S3 (stale), appends any S3 position missing from layout (drift) at the
// end in ascending order - safe because this only ever runs to recover
// from drift, not as part of normal create/edit/delete/reorder, so it
// doesn't need to guess the admin's intended position for a recovered item,
// only guarantee nothing stays invisible or duplicated.
export const reconcilePortfolioLayout = (existingLayout, truePositions) => {
  const trueSet = new Set(truePositions);
  const keptEntries = existingLayout.filter(
    (entry) => entry.type === "memo" || trueSet.has(entry.position),
  );
  const seenPositions = new Set(
    keptEntries.filter((entry) => entry.type === "image").map((entry) => entry.position),
  );
  const missing = truePositions.filter((position) => !seenPositions.has(position));
  const appended = missing.map((position) => ({ type: "image", position }));

  return [...keptEntries, ...appended];
};
