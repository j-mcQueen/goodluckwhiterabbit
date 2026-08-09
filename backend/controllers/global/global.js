import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { validateParams } from "../utils/validateParams.js";
import { s3 } from "../config/s3.js";
import { verifyTokens } from "../utils/verifyTokens.js";
import {
  loadPortfolioTaxonomy,
  formatPublicTaxonomy,
} from "../utils/loadPortfolioTaxonomy.js";
import PortfolioSubcategory from "../../models/portfolioSubcategory.js";
import PortfolioMemo from "../../models/portfolioMemo.js";

const findFilterSort = async (
  bucket,
  prefix,
  regex,
  size,
  group = undefined,
  skipSort = false,
) => {
  let objects;
  try {
    objects = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        StartAfter: group ? `${prefix}/${group}/${size}` : undefined,
        MaxKeys: group ? 100 : 250,
      }),
    );
  } catch (error) {
    throw error;
  }

  let filtered = (objects.Contents ?? []).filter(
    (item) => item.Key.includes(`/${size}/`) && item.Size > 0,
  );

  const sorted = skipSort ? filtered : sortBatch(filtered, regex);
  objects.Contents = sorted;

  return { objects, stored: sorted.length };
};

const sortBatch = (arr, suffixRegex, groupRegex) => {
  return arr.sort((a, b) => {
    if (groupRegex) {
      const groupA = Number(a.Key.match(groupRegex)?.[1] ?? 0);
      const groupB = Number(b.Key.match(groupRegex)?.[1] ?? 0);

      if (groupA < groupB) return -1;
      if (groupA > groupB) return 1;
    }

    const suffixA = Number(a.Key.match(suffixRegex)?.[1] ?? 0);
    const suffixB = Number(b.Key.match(suffixRegex)?.[1] ?? 0);

    return suffixA - suffixB;
  });
};

export const logout = async (req, res, next) => {
  // revoke refresh and access tokens
  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: true,
    })
    .end();
};

export const generateGetPresigned = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    let s3Data = {};
    try {
      const { objects, stored } = await findFilterSort(
        process.env.AWS_PRIMARY_BUCKET,
        `${req.params.id}/${req.params.imageset}`,
        /\/(\d{1,3})\//,
        req.params.size,
      );
      s3Data.results = objects;
      s3Data.stored = stored;

      if (s3Data.stored === 0)
        return res.status(200).json({ files: false });
    } catch (error) {
      if (typeof s3Data.results === "undefined")
        return res.status(200).json({ files: false });

      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    // loop over S3 objects and generate presigns for matches
    const presigns = [];
    const skipped = [];
    const indexRegex = new RegExp(
      `/${req.params.imageset}/(\\d+)/${req.params.size}/`,
    );

    for (let i = 0; i < s3Data.results.Contents.length; i++) {
      const position = s3Data.results.Contents[i].Key.match(indexRegex);
      if (
        Number(position[1]) >= Number(req.params.start) && // this ensures we will always pick up from where we left off when a new batch has been requested
        Number(position[1]) <= Number(req.params.end) // ensures "out-of-bounds" presigns aren't included
      ) {
        const cmd = new GetObjectCommand({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Key: s3Data.results.Contents[i].Key,
        });

        let url = "";
        try {
          url = await getSignedUrl(s3, cmd, { expiresIn: 600 });
          if (!url) throw new Error("500");
        } catch (error) {
          // populate an array to transmit to client if signed url generation fails
          const constituents = s3Data.results.Contents[i].Key.split("/");
          const filename = constituents.pop();
          skipped.push(filename);
          continue;
        }

        presigns.push(url);
      }

      if (presigns.length === 10) break;
    }

    return skipped.length > 0
      ? res.status(200).json({ presigns, skipped, stored: s3Data.stored })
      : res.status(200).json({ presigns, stored: s3Data.stored });
  }
};

export const getPortfolioTaxonomy = async (req, res, next) => {
  let docs;
  try {
    docs = await loadPortfolioTaxonomy();
  } catch (error) {
    return res.status(500).json({
      status: true,
      message:
        "There was an error retrieving the portfolio taxonomy. Please refresh the page and try again. Let Jack know if the problem persists!",
    });
  }

  return res.status(200).json(formatPublicTaxonomy(docs));
};

export const generatePortfolioUrls = async (req, res, next) => {
  const verified = await validateParams(
    req.params.category,
    req.params.sub,
    req.params.group,
    req.params.size,
    req.params.start,
  );

  if (verified.error) {
    return res.status(400).json(verified.error);
  } else {
    const groupRegex = /\/(\d{3})\//;
    const suffixRegex = `(?<=/${req.params.size}/[^/]+_)(\\d{1,3})(?=\\.[^.]+$)`;

    let s3Data = {};
    try {
      // find, filter, and sort objects by their group numbers
      const { objects, stored } = await findFilterSort(
        process.env.AWS_SECONDARY_BUCKET,

        `${req.params.category}/${req.params.sub}`,
        groupRegex,
        req.params.size,
        req.params.group,
        true, // the group+suffix sort below is the real one; skip the redundant inner sort
      );

      if (stored === 0) return res.status(200).json({ files: false });

      const suffixSorted = sortBatch(objects.Contents, suffixRegex, groupRegex);

      s3Data.results = suffixSorted;
      s3Data.stored = stored;
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        status: true,
        loading: false,
        message:
          "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
      });
    }

    const keys = [];
    let normalizedGroup = req.params.group;
    let normalizedStart = req.params.start;
    for (const obj of s3Data.results) {
      // check for out-of-bounds starts (+ groups with)
      const keyGroup = Number(obj.Key.match(groupRegex)[1]);
      if (keyGroup > normalizedGroup && normalizedStart > 0) {
        normalizedGroup = keyGroup;
        normalizedStart = 0;
      }

      const match = obj.Key.match(suffixRegex);
      const pos = Number(match[0]);

      // skip edge cases which indicate incorrect starting point
      if (keyGroup < normalizedGroup || !match) continue;
      if (keyGroup >= normalizedGroup && pos < normalizedStart) continue;

      // get the keys you want to generate presigned urls for from the given starting point
      if (pos >= Number(normalizedStart)) keys.push(obj.Key);
      if (keys.length === 10) break;
    }

    const presignPromises = keys.map(async (key) => {
      const cmd = new GetObjectCommand({
        Bucket: process.env.AWS_SECONDARY_BUCKET,
        Key: key,
      });

      try {
        const url = await getSignedUrl(s3, cmd, { expiresIn: 600 });
        return { status: "fulfilled", key, url };
      } catch (error) {
        return { status: "rejected", key };
      }
    });

    const results = await Promise.allSettled(presignPromises);

    const presigns = [];
    const skipped = [];
    for (const result of results) {
      if (
        result.status === "fulfilled" &&
        result.value.status === "fulfilled"
      ) {
        presigns.push(result.value.url);
      } else {
        const key = result.value.key;
        skipped.push(key.split("/").pop());
      }
    }

    return skipped.length > 0
      ? res.status(200).json({ presigns, keys, skipped, stored: s3Data.stored })
      : res.status(200).json({ presigns, keys, stored: s3Data.stored });
  }
};

// layout-aware counterpart to generatePortfolioUrls above, used only for
// a single group whose taxonomy hasMemo flag is true (§2.1/§5). Unlike
// generatePortfolioUrls this does not spill over into the next group in a
// subcategory once exhausted - deliberately out of scope here (see spec
// task notes on the public-site spillover/memo-boundary interaction), so
// the client is responsible for switching group/endpoint at that boundary.
// Paginates over `layout` array indices, resolving each entry to either a
// presigned image URL or inlined memo html, same response shape as the
// admin version (adminGetPortfolioGroupLayout).
export const generatePortfolioLayoutUrls = async (req, res, next) => {
  const { category, sub, groupId, size, start } = req.params;

  if (size !== "sm" && size !== "lg") {
    return res.status(400).json({ error: "Invalid size" });
  }
  if (!Number.isInteger(Number(start)) || Number(start) < 0) {
    return res.status(400).json({ error: "Invalid start index" });
  }

  const subcategory = await PortfolioSubcategory.findOne({ category, name: sub });
  const group = subcategory?.groups.find((g) => g.groupId === groupId);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const startNum = Number(start);
  const batch = group.layout.slice(startNum, startNum + 10);

  if (batch.length === 0) return res.status(200).json({ files: false });

  const groupPrefix = `${category}/${sub}/${groupId}/`;
  const positionRegex = /_(\d{1,3})\.[^.]+$/;
  const keyByPosition = new Map();

  if (batch.some((entry) => entry.type === "image")) {
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
      });
    }

    for (const obj of listed.Contents ?? []) {
      if (!obj.Key.includes(`/${size}/`) || obj.Size === 0) continue;
      const match = obj.Key.match(positionRegex);
      if (match) keyByPosition.set(Number(match[1]), obj.Key);
    }
  }

  const results = await Promise.allSettled(
    batch.map(async (entry) => {
      if (entry.type === "memo") {
        const memo = await PortfolioMemo.findOne({ memoId: entry.memoId }).lean();
        if (!memo) throw new Error("memo missing");
        return { type: "memo", memoId: entry.memoId, html: memo.html };
      }

      const key = keyByPosition.get(entry.position);
      if (!key) throw new Error("image missing");
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: process.env.AWS_SECONDARY_BUCKET, Key: key }),
        { expiresIn: 600 },
      );
      return { type: "image", position: entry.position, url };
    }),
  );

  const items = [];
  const skipped = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(result.value);
    } else {
      const entry = batch[i];
      skipped.push(entry.type === "memo" ? entry.memoId : String(entry.position));
    }
  });

  return res.status(200).json({ items, stored: group.layout.length, skipped });
};

// tiny, dedicated check so the public site can decide, per group, whether
// to use the layout-aware read path or the untouched existing one, without
// changing the shape of getPortfolioTaxonomy's response (which every
// visitor's sidebar/menu already depends on) or its many existing
// consumers (Sidebar.tsx, GroupList.tsx, MenuItem.tsx, mobile nav, etc.)
export const getPortfolioGroupHasMemo = async (req, res, next) => {
  const { category, sub, groupId } = req.params;

  const subcategory = await PortfolioSubcategory.findOne(
    { category, name: sub },
    { groups: 1 },
  );
  const group = subcategory?.groups.find((g) => g.groupId === groupId);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const hasMemo = group.layout.some((entry) => entry.type === "memo");
  return res.status(200).json({ hasMemo });
};

export const countImagesetItems = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    // retrieve all S3 objects
    let s3Objects;
    try {
      s3Objects = await s3.send(
        new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET }),
      );

      if (!s3Objects.Contents)
        return res
          .status(200)
          .json({ snapshots: 0, keepsake: 0, core: 0, socials: 0 });

      if (!s3Objects) throw new Error("500");
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    const totals = { snapshots: 0, keepsake: 0, core: 0, socials: 0 };

    for (let i = 0; i < s3Objects.Contents.length; i++) {
      if (s3Objects.Contents[i].Key.includes(req.params.id)) {
        if (s3Objects.Contents[i].Key.includes("snapshots"))
          totals["snapshots"]++;
        else if (s3Objects.Contents[i].Key.includes("keepsake"))
          totals["keepsake"]++;
        else if (s3Objects.Contents[i].Key.includes("core"))
          totals["core"]++;
        else if (s3Objects.Contents[i].Key.includes("socials"))
          totals["socials"]++;
      }
    }
    return res.status(200).json(totals);
  }
};
