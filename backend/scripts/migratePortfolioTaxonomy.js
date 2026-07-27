import "dotenv/config";
import mongoose from "mongoose";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

import { s3 } from "../controllers/config/s3.js";
import PortfolioSubcategory from "../models/portfolioSubcategory.js";

// One-time seed of the new DB-backed portfolio taxonomy from the legacy
// hardcoded sidebar_data (client/src/components/portfolio/data/sidebar/data.ts)
// and the `subs` index->name map (client/src/components/portfolio/utils/triggerBatch.ts),
// captured here as of the migration date. Safe to re-run: existing groups are
// left untouched, only missing ones are added.
const LEGACY_TAXONOMY = [
  {
    category: "PHOTO",
    subcategories: [
      {
        name: "WEDDINGS",
        groups: {
          "STRONG ROPE BREWERY": "001",
          "RED BUTTE GARDENS": "002",
          "9 ORCHARD": "003",
          MONROE: "004",
          ATMOSFERA: "005",
          "THE RIVER CAFE": "006",
          "MILK & ROSES I": "007",
          "FANDI MATA": "008",
          "LE FANFARE": "009",
          "CARROLL GARDEN": "010",
          TUFFET: "011",
          "TIME 100": "012",
          "THE BOX HOUSE": "013",
          "MILK & ROSES II": "014",
          "BK WINERY": "015",
          "501 UNION": "016",
          "THE SANCTUARY": "017",
        },
      },
      {
        name: "EVENTS",
        groups: {
          "EVENT 1": "001",
          "EVENT 2": "002",
          "EVENT 3": "003",
          "EVENT 4": "004",
        },
      },
      {
        name: "FILM",
        groups: {
          "FILM 1": "001",
          "FILM 2": "002",
          "FILM 3": "003",
          "FILM 4": "004",
        },
      },
      {
        name: "COMMERCIAL",
        groups: {
          "COMMERCIAL 1": "001",
          "COMMERCIAL 2": "002",
          "COMMERCIAL 3": "003",
          "COMMERCIAL 4": "004",
        },
      },
      {
        name: "EDITORIAL",
        groups: {
          "EDITORIAL 1": "001",
          "EDITORIAL 2": "002",
          "EDITORIAL 3": "003",
          "EDITORIAL 4": "004",
        },
      },
    ],
  },
  { category: "ART", subcategories: [] },
  { category: "DESIGN", subcategories: [] },
];

const groupHasS3Content = async (category, sub, groupId) => {
  const prefix = `${category}/${sub}/${groupId}/`;
  // MaxKeys:1 would risk landing on the zero-byte "folder" marker object
  // (Key === prefix itself, Size 0) before ever seeing a real file, so pull
  // a few keys and filter for one with actual content.
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.AWS_SECONDARY_BUCKET,
      Prefix: prefix,
      MaxKeys: 5,
    }),
  );

  return (result.Contents ?? []).some((obj) => obj.Size > 0);
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const { category, subcategories } of LEGACY_TAXONOMY) {
    for (const [subOrder, { name, groups }] of subcategories.entries()) {
      const groupEntries = Object.entries(groups);

      // never allocate a new group id below anything the legacy data already
      // used, verified or not, so a later admin-added group can't collide
      // with an old, currently-unpopulated slot.
      const nextGroupSeq =
        groupEntries.length > 0
          ? Math.max(...groupEntries.map(([, groupId]) => Number(groupId))) + 1
          : 1;

      const verifiedGroups = [];
      for (const [groupOrder, [groupName, groupId]] of groupEntries.entries()) {
        const exists = await groupHasS3Content(category, name, groupId);
        if (!exists) {
          console.log(
            `Skipping ${category}/${name}/${groupId} ("${groupName}") - no S3 content found`,
          );
          continue;
        }
        verifiedGroups.push({ groupId, name: groupName, order: groupOrder, count: 0 });
      }

      const existing = await PortfolioSubcategory.findOne({ category, name });

      if (existing) {
        const missingGroups = verifiedGroups.filter(
          (group) => !existing.groups.some((g) => g.groupId === group.groupId),
        );

        if (missingGroups.length === 0) {
          console.log(`${category}/${name} already up to date, skipping`);
          continue;
        }

        existing.groups.push(...missingGroups);
        existing.nextGroupSeq = Math.max(existing.nextGroupSeq, nextGroupSeq);
        await existing.save();
        console.log(
          `Updated ${category}/${name} with ${missingGroups.length} new group(s)`,
        );
        continue;
      }

      if (verifiedGroups.length === 0 && groupEntries.length > 0) {
        console.log(
          `Skipping subcategory ${category}/${name} - no group had verifiable S3 content`,
        );
        continue;
      }

      await PortfolioSubcategory.create({
        category,
        name,
        order: subOrder,
        nextGroupSeq,
        groups: verifiedGroups,
      });
      console.log(
        `Created ${category}/${name} with ${verifiedGroups.length} group(s)`,
      );
    }
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
