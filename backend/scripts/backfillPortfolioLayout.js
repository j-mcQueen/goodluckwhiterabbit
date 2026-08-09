// One-time backfill: derive `layout` for every existing portfolio group
// from a live S3 listing (ground truth - the cached `count` field is known
// to have drifted and is not trusted here) and write it to Mongo. Also
// corrects any `count` drift found along the way, as a side effect.
//
// Safe to run repeatedly - it fully re-derives from S3 each time, so runs
// after the first are a no-op except for any drift picked up since.
//
// Usage:
//   node scripts/backfillPortfolioLayout.js            (dry run - prints only)
//   node scripts/backfillPortfolioLayout.js --commit    (writes to Mongo)
//
// Run from the backend/ directory so node_modules resolves.

import "dotenv/config";
import mongoose from "mongoose";
import PortfolioSubcategory from "../models/portfolioSubcategory.js";
import { derivePortfolioLayoutFromS3 } from "../controllers/utils/derivePortfolioLayoutFromS3.js";

const commit = process.argv.includes("--commit");

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const subcategories = await PortfolioSubcategory.find({});
  let groupsSeen = 0;
  let groupsChanged = 0;

  for (const sub of subcategories) {
    for (const group of sub.groups) {
      groupsSeen += 1;
      const derivedLayout = await derivePortfolioLayoutFromS3(sub.category, sub.name, group.groupId);
      const derivedCount = derivedLayout.length;

      const currentLayout = (group.layout ?? []).map((entry) => ({
        type: entry.type,
        position: entry.position,
      }));
      const layoutChanged = JSON.stringify(currentLayout) !== JSON.stringify(derivedLayout);
      const countChanged = group.count !== derivedCount;

      if (layoutChanged || countChanged) {
        groupsChanged += 1;
        console.log(
          `[${commit ? "COMMIT" : "DRY RUN"}] ${sub.category}/${sub.name}/${group.groupId} (${group.name})`,
        );
        if (layoutChanged) {
          console.log(`  layout: ${JSON.stringify(currentLayout)} -> ${JSON.stringify(derivedLayout)}`);
        }
        if (countChanged) {
          console.log(`  count: ${group.count} -> ${derivedCount}`);
        }
      }

      if (commit) {
        group.layout = derivedLayout;
        group.count = derivedCount;
      }
    }

    if (commit) await sub.save();
  }

  console.log(
    `\n${groupsSeen} groups checked, ${groupsChanged} ${commit ? "updated" : "would be updated"}.`,
  );

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
