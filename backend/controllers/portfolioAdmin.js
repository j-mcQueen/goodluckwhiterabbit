import sharp from "sharp";
import pLimit from "p-limit";
import { unlink } from "fs/promises";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "./config/s3.js";
import { verifyTokens } from "./utils/verifyTokens.js";
import {
  loadPortfolioTaxonomy,
  formatAdminTaxonomy,
} from "./utils/loadPortfolioTaxonomy.js";
import { deleteS3Prefix } from "./utils/deleteS3Prefix.js";
import { updatePortfolioGroupCount } from "./utils/updatePortfolioGroupCount.js";
import PortfolioSubcategory from "../models/portfolioSubcategory.js";

const CATEGORIES = ["PHOTO", "ART", "DESIGN"];
const SUBCATEGORY_NAME_REGEX = /^[A-Z0-9_-]{1,50}$/;
const limit = pLimit(3);

// looks up the subcategory doc by (category, name) and confirms groupId
// exists within it - shared by both upload handlers below
const findGroupOwner = async (category, sub, groupId) => {
  const subcategory = await PortfolioSubcategory.findOne({ category, name: sub });
  if (!subcategory) return { error: "Subcategory not found" };
  if (!subcategory.groups.some((group) => group.groupId === groupId)) {
    return { error: "Group not found" };
  }
  return { subcategory };
};

const isValidPosition = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 0 && num <= 999;
};

// matches an object at a given in-group position, in either size folder -
// shared by upload's replace-cleanup, single-image delete, and swap
const positionSuffixRegex = (position) =>
  new RegExp(`/(?:sm|lg)/[^/]+_${position}\\.[^./]+$`);

// keeps the client's descriptive filename (S3/URL-safe'd) rather than
// discarding it - the position suffix appended after this is still what
// the existing public reader's suffixRegex actually parses for ordering,
// and it always wins there since that regex is anchored to the very end
// of the filename regardless of what digits/underscores appear earlier
const sanitizeFilenameBase = (originalname) => {
  const withoutExtension = String(originalname ?? "").replace(/\.[^.]+$/, "");
  const cleaned = withoutExtension
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "img";
};

export const adminGetPortfolioTaxonomy = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    let docs;
    try {
      docs = await loadPortfolioTaxonomy();
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving the portfolio taxonomy. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    return res.status(200).json(formatAdminTaxonomy(docs));
  }
};

export const adminAddSubcategory = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const category = req.params.category;
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // subcategory `name` is a literal S3 key segment - keep it restrictive
    const name = String(req.body.name ?? "").trim().toUpperCase();
    if (!SUBCATEGORY_NAME_REGEX.test(name)) {
      return res.status(400).json({
        error:
          "Invalid subcategory name - use only letters, numbers, underscores, and hyphens",
      });
    }

    try {
      const order = await PortfolioSubcategory.countDocuments({ category });
      const created = await PortfolioSubcategory.create({
        category,
        name,
        order,
        groups: [],
      });
      return res.status(201).json({
        _id: created._id,
        category: created.category,
        name: created.name,
        order: created.order,
        groups: [],
      });
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(409)
          .json({ error: "A subcategory with that name already exists" });
      }
      return res.status(500).json({
        status: true,
        message:
          "There was an error creating the subcategory. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }
  }
};

export const adminDeleteSubcategory = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    let removed;
    try {
      removed = await PortfolioSubcategory.findByIdAndDelete(req.params.subId);
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error deleting the subcategory. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    if (!removed) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    let deletedCount = 0;
    try {
      deletedCount = await deleteS3Prefix(
        process.env.AWS_SECONDARY_BUCKET,
        `${removed.category}/${removed.name}/`,
      );
    } catch (error) {
      // the taxonomy record is already gone; surface the S3 failure so the
      // admin knows a manual bucket cleanup may be needed, matching the
      // existing adminDeleteUser pattern of no rollback on S3 errors
      return res.status(500).json({
        status: true,
        message:
          "The subcategory was removed, but some of its files may not have been deleted from storage. Let Jack know so the bucket can be checked.",
        logout: { status: false, path: null },
      });
    }

    return res.status(200).json({ success: true, deletedCount });
  }
};

export const adminAddGroup = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const name = String(req.body.name ?? "").trim();
    if (name.length === 0 || name.length > 100) {
      return res.status(400).json({ error: "Invalid group name" });
    }

    let claimed;
    try {
      // atomically claim the next group id - the filter guards against ever
      // exceeding the 3-digit "001".."999" range and against a lost-update
      // race between two concurrent group creations
      claimed = await PortfolioSubcategory.findOneAndUpdate(
        { _id: req.params.subId, nextGroupSeq: { $lte: 999 } },
        { $inc: { nextGroupSeq: 1 } },
        { new: false },
      );
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error creating the group. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    if (!claimed) {
      const exists = await PortfolioSubcategory.exists({ _id: req.params.subId });
      return exists
        ? res.status(400).json({ error: "No available group ids remain (001-999 exhausted)" })
        : res.status(404).json({ error: "Subcategory not found" });
    }

    const groupId = String(claimed.nextGroupSeq).padStart(3, "0");
    const order = claimed.groups.length;

    try {
      await PortfolioSubcategory.findByIdAndUpdate(req.params.subId, {
        $push: { groups: { groupId, name, order, count: 0 } },
      });
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error creating the group. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    return res.status(201).json({ groupId, name, order, count: 0 });
  }
};

export const adminDeleteGroup = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const { subId, groupId } = req.params;

    let before;
    try {
      before = await PortfolioSubcategory.findOneAndUpdate(
        { _id: subId },
        { $pull: { groups: { groupId } } },
        { new: false },
      );
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error deleting the group. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    if (!before) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    const existed = before.groups.some((group) => group.groupId === groupId);
    if (!existed) {
      return res.status(404).json({ error: "Group not found" });
    }

    let deletedCount = 0;
    try {
      deletedCount = await deleteS3Prefix(
        process.env.AWS_SECONDARY_BUCKET,
        `${before.category}/${before.name}/${groupId}/`,
      );
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "The group was removed, but some of its files may not have been deleted from storage. Let Jack know so the bucket can be checked.",
        logout: { status: false, path: null },
      });
    }

    return res.status(200).json({ success: true, deletedCount });
  }
};

// single-image upload into a specific position within a group (drag-onto-slot,
// or a slot replace) - mirrors admin.js's uploadFile, but sm/lg only (no `og`)
// and keyed by the client's own filename with a required `_{position}` suffix
// appended (sanitizeFilenameBase). A replace at the same position may still
// produce a different key than what's already there (different original
// filename), so stale objects at that position are found by suffix match and
// cleaned up explicitly below rather than assumed to be overwritten in place.
export const adminUploadPortfolioImage = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const { category, sub, groupId } = req.params;
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    if (!isValidPosition(req.body.position)) {
      return res.status(400).json({ error: "Invalid position" });
    }
    const position = Number(req.body.position);

    const owner = await findGroupOwner(category, sub, groupId);
    if (owner.error) return res.status(404).json({ error: owner.error });

    const file = req.files?.[0];
    if (!file) return res.status(400).json({ error: "No file provided" });

    const prefix = `${category}/${sub}/${groupId}/`;
    const suffixRegex = positionSuffixRegex(position);

    let large, small, existing;
    try {
      [large, small, existing] = await Promise.all([
        sharp(file.buffer).resize(2400, null).toFormat("webp").toBuffer(),
        sharp(file.buffer).resize(768, null).toFormat("webp").toBuffer(),
        s3.send(
          new ListObjectsV2Command({
            Bucket: process.env.AWS_SECONDARY_BUCKET,
            Prefix: prefix,
          }),
        ),
      ]);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "There was an error processing this image." });
    }

    const filename = `${sanitizeFilenameBase(file.originalname)}_${position}.webp`;
    const newKeys = [`${prefix}sm/${filename}`, `${prefix}lg/${filename}`];

    try {
      await Promise.all([
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_SECONDARY_BUCKET,
            Key: newKeys[0],
            Body: small,
            ContentType: "image/webp",
          }),
        ),
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_SECONDARY_BUCKET,
            Key: newKeys[1],
            Body: large,
            ContentType: "image/webp",
          }),
        ),
      ]);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "There was an error uploading this file to S3." });
    }

    const existingMatches = (existing.Contents ?? []).filter((obj) =>
      suffixRegex.test(obj.Key),
    );
    const staleKeys = existingMatches
      .map((obj) => obj.Key)
      .filter((key) => !newKeys.includes(key));

    if (staleKeys.length > 0) {
      try {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.AWS_SECONDARY_BUCKET,
            Delete: { Objects: staleKeys.map((Key) => ({ Key })) },
          }),
        );
      } catch (error) {
        // the new image uploaded successfully; a lingering orphan here
        // is a lesser problem than failing a request that otherwise succeeded
        console.log("error cleaning up stale portfolio image keys", error);
      }
    }

    const isReplace = existingMatches.length > 0;
    if (!isReplace) {
      await updatePortfolioGroupCount(
        owner.subcategory._id,
        groupId,
        res,
        PortfolioSubcategory,
        1,
      );
    }

    return res.status(200).send(small);
  }
};

// multi-file append upload - mirrors admin.js's bulkUpload, but simpler:
// no `og` variant, and no filename-suffix sort step since the browser-built
// upload queue's array order already is the intended position order (§7)
export const adminBulkUploadPortfolioImages = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const files = req.files ?? [];
    const tempPaths = files.map((file) => file.path);
    const { category, sub, groupId } = req.params;

    const cleanupTemp = () =>
      Promise.all(
        tempPaths.map((path) =>
          unlink(path).catch((error) => {
            if (error.code !== "ENOENT") console.error("Cleanup failed:", error);
          }),
        ),
      );

    if (!CATEGORIES.includes(category)) {
      await cleanupTemp();
      return res.status(400).json({ error: "Invalid category" });
    }

    const owner = await findGroupOwner(category, sub, groupId);
    if (owner.error) {
      await cleanupTemp();
      return res.status(404).json({ error: owner.error });
    }

    const existingCount = Number(req.query.fileCount) || 0;
    const prefix = `${category}/${sub}/${groupId}/`;

    const uploadToS3 = (buffer, key) =>
      s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_SECONDARY_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: "image/webp",
        }),
      );

    try {
      const settled = await Promise.allSettled(
        files.map((file, index) =>
          limit(async () => {
            const position = index + existingCount;
            const filename = `${sanitizeFilenameBase(file.originalname)}_${position}.webp`;
            const [largeBuffer, smallBuffer] = await Promise.all([
              sharp(file.path).resize(2400, null).toFormat("webp").toBuffer(),
              sharp(file.path).resize(768, null).toFormat("webp").toBuffer(),
            ]);

            await Promise.all([
              uploadToS3(largeBuffer, `${prefix}lg/${filename}`),
              uploadToS3(smallBuffer, `${prefix}sm/${filename}`),
            ]);
          }),
        ),
      );

      const succeeded = settled
        .map((item, i) => (item.status === "fulfilled" ? files[i].originalname : null))
        .filter(Boolean);
      const failed = settled
        .map((item, i) => (item.status === "rejected" ? files[i].originalname : null))
        .filter(Boolean);

      await updatePortfolioGroupCount(
        owner.subcategory._id,
        groupId,
        res,
        PortfolioSubcategory,
        succeeded.length,
      );

      return res.status(200).json({
        succeeded,
        failed,
        newCount: succeeded.length + existingCount,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Upload failed", detail: error.message });
    } finally {
      await cleanupTemp();
    }
  }
};

// deletes one image (both size variants) at a given in-group position -
// mirrors admin.js's adminDeleteFile, but matches by filename suffix rather
// than a per-image folder prefix, since a portfolio group's images share one
// folder. Leaves a gap rather than compacting remaining positions, same as
// the private-gallery convention.
export const adminDeletePortfolioImage = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const { category, sub, groupId, position } = req.params;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (!isValidPosition(position)) {
      return res.status(400).json({ error: "Invalid position" });
    }

    const owner = await findGroupOwner(category, sub, groupId);
    if (owner.error) return res.status(404).json({ error: owner.error });

    const groupPrefix = `${category}/${sub}/${groupId}/`;
    const regex = positionSuffixRegex(position);

    try {
      const listed = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_SECONDARY_BUCKET,
          Prefix: groupPrefix,
        }),
      );
      const matches = (listed.Contents ?? []).filter((obj) => regex.test(obj.Key));

      if (matches.length === 0) {
        return res.status(404).json({ error: "Image not found" });
      }

      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.AWS_SECONDARY_BUCKET,
          Delete: { Objects: matches.map((obj) => ({ Key: obj.Key })) },
        }),
      );
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "We could not delete this file from S3.",
      });
    }

    await updatePortfolioGroupCount(
      owner.subcategory._id,
      groupId,
      res,
      PortfolioSubcategory,
      -1,
    );

    return res.status(200).json({ success: true });
  }
};

// reorders two images within the same group - adapted from admin.js's
// adminSwapFiles, but since a portfolio group's images share one folder
// (rather than each image owning its own index folder), "moving" a file
// means renaming the `_{position}` suffix on its filename, not renaming a
// folder segment. The temp-staging-on-collision algorithm is otherwise the
// same: an occupied destination is staged first so a same-named file at
// each position can never clobber the other mid-copy.
export const adminSwapPortfolioImages = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const { category, sub, groupId, from, to } = req.params;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (!isValidPosition(from) || !isValidPosition(to)) {
      return res.status(400).json({ error: "Invalid position" });
    }

    const owner = await findGroupOwner(category, sub, groupId);
    if (owner.error) return res.status(404).json({ error: owner.error });

    if (from === to) return res.status(200).json({ success: true });

    const bucket = process.env.AWS_SECONDARY_BUCKET;
    const groupPrefix = `${category}/${sub}/${groupId}/`;
    const fromRegex = positionSuffixRegex(from);
    const toRegex = positionSuffixRegex(to);
    const renamePosition = (key, fromPos, toPos) =>
      key.replace(new RegExp(`_${fromPos}\\.([^./]+)$`), `_${toPos}.$1`);
    const encodeKey = (key) => key.split("/").map(encodeURIComponent).join("/");
    const copy = (sourceKey, destinationKey) =>
      s3.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${encodeKey(sourceKey)}`,
          Key: destinationKey,
        }),
      );

    try {
      const listed = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: groupPrefix }),
      );
      const contents = listed.Contents ?? [];

      const sourceObjects = contents.filter((obj) => fromRegex.test(obj.Key));
      const destObjects = contents.filter((obj) => toRegex.test(obj.Key));

      if (sourceObjects.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "There is nothing to move at the source position.",
        });
      }

      const newKeys = new Set(
        sourceObjects.map((obj) => renamePosition(obj.Key, from, to)),
      );
      let tempKeys = [];

      if (destObjects.length === 0) {
        // target position is empty - plain move, no collision possible
        await Promise.all(
          sourceObjects.map((obj) => copy(obj.Key, renamePosition(obj.Key, from, to))),
        );
      } else {
        // target position is occupied - stage its files first so a
        // coincidentally shared filename can't clobber content mid-copy
        const tempPrefix = `${groupPrefix}__swap-${Date.now()}__/`;
        tempKeys = destObjects.map(
          (obj) => tempPrefix + obj.Key.slice(groupPrefix.length),
        );

        await Promise.all(destObjects.map((obj, i) => copy(obj.Key, tempKeys[i])));
        await Promise.all(
          sourceObjects.map((obj) => copy(obj.Key, renamePosition(obj.Key, from, to))),
        );
        await Promise.all(
          tempKeys.map((key, i) =>
            copy(key, renamePosition(destObjects[i].Key, to, from)),
          ),
        );

        destObjects.forEach((obj) => newKeys.add(renamePosition(obj.Key, to, from)));
      }

      const oldKeys = [...sourceObjects, ...destObjects].map((obj) => obj.Key);
      const staleKeys = oldKeys.filter((key) => !newKeys.has(key));

      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: [...staleKeys, ...tempKeys].map((Key) => ({ Key })) },
        }),
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "We could not reorder this image in storage.",
      });
    }
  }
};

// absolute-set count reconciliation, mirroring admin.js's
// adminUpdateUserImagesetCount - used by the frontend's self-healing pattern
// when a load discovers the true S3 count differs from what's stored
export const adminUpdatePortfolioGroupCount = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const { subId, groupId, count } = req.params;

    const updated = await PortfolioSubcategory.findOneAndUpdate(
      { _id: subId, "groups.groupId": groupId },
      { $set: { "groups.$.count": Number(count) } },
      { new: true },
    );

    if (!updated) return res.status(404).json({ error: "Group not found" });

    const group = updated.groups.find((g) => g.groupId === groupId);
    return res.status(200).json({ count: group.count });
  }
};

// admin-only read endpoint for the ordering grid, deliberately NOT a reuse of
// the public generatePortfolioUrls (global.js) - that endpoint intentionally
// spills over into the next group within a subcategory once the current one
// runs out (it powers the public infinite-scroll), and its `stored` count is
// a pagination-cursor count across the whole subcategory, not a true
// per-group total. Neither behavior is safe for an admin tool that manages
// one exact group's images and needs an authoritative count for self-healing.
export const adminGetPortfolioGroupImages = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const { category, sub, groupId, size, start } = req.params;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (size !== "sm" && size !== "lg") {
      return res.status(400).json({ error: "Invalid size" });
    }
    if (!Number.isInteger(Number(start)) || Number(start) < 0) {
      return res.status(400).json({ error: "Invalid start index" });
    }

    const owner = await findGroupOwner(category, sub, groupId);
    if (owner.error) return res.status(404).json({ error: owner.error });

    const groupPrefix = `${category}/${sub}/${groupId}/`;
    const positionRegex = /_(\d{1,3})\.[^.]+$/;

    let listed;
    try {
      listed = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_SECONDARY_BUCKET,
          Prefix: groupPrefix,
        }),
      );
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving these images from S3. Please refresh the page and try again.",
        logout: { status: false, path: null },
      });
    }

    const matches = (listed.Contents ?? []).filter(
      (obj) => obj.Key.includes(`/${size}/`) && obj.Size > 0,
    );
    const stored = matches.length;

    if (stored === 0) return res.status(200).json({ files: false });

    const sorted = matches.sort((a, b) => {
      const posA = Number(a.Key.match(positionRegex)?.[1] ?? 0);
      const posB = Number(b.Key.match(positionRegex)?.[1] ?? 0);
      return posA - posB;
    });

    const startNum = Number(start);
    const keys = [];
    for (const obj of sorted) {
      const pos = Number(obj.Key.match(positionRegex)?.[1]);
      if (!Number.isInteger(pos) || pos < startNum) continue;
      keys.push(obj.Key);
      if (keys.length === 10) break;
    }

    const presignResults = await Promise.allSettled(
      keys.map(async (key) => {
        const cmd = new GetObjectCommand({
          Bucket: process.env.AWS_SECONDARY_BUCKET,
          Key: key,
        });
        const url = await getSignedUrl(s3, cmd, { expiresIn: 600 });
        return { key, url };
      }),
    );

    const presigns = [];
    const resolvedKeys = [];
    const skipped = [];
    for (let i = 0; i < presignResults.length; i++) {
      const result = presignResults[i];
      if (result.status === "fulfilled") {
        presigns.push(result.value.url);
        resolvedKeys.push(result.value.key);
      } else {
        skipped.push(keys[i].split("/").pop());
      }
    }

    return skipped.length > 0
      ? res.status(200).json({ presigns, keys: resolvedKeys, skipped, stored })
      : res.status(200).json({ presigns, keys: resolvedKeys, stored });
  }
};
