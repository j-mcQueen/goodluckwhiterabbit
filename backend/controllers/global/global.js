const { verifyTokens } = require("../utils/verifyTokens");
const { s3 } = require("../config/s3");
const {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { validateParams } = require("../utils/validateParams");

const findFilterSort = async (bucket, group, prefix, regex, size) => {
  const adjustedGroup = Number(group) - 1;
  const start = String(adjustedGroup).padStart(3, "0");
  let objects;
  try {
    objects = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        StartAfter: `${prefix}/${start}/`,
        MaxKeys: 100,
      }),
    );
  } catch (error) {
    throw error;
  }

  let filtered = objects.Contents.filter(
    (item) => item.Key.includes(`/${size}/`) && item.Size > 0,
  );

  const sorted = sortBatch(filtered, regex);
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

    const suffixA = Number(a.Key.match(suffixRegex)?.[0] ?? 0);
    const suffixB = Number(b.Key.match(suffixRegex)?.[0] ?? 0);

    return suffixA - suffixB;
  });
};

exports.logout = async (req, res, next) => {
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

exports.generatePutPresigned = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    // resized file
    const cmd1 = new PutObjectCommand({
      Bucket: process.env.AWS_PRIMARY_BUCKET,
      Key: `${req.body._id}/${req.body.imageset}/resized/${req.body.index}/${req.body.files[0]}`,
    });

    // original file
    const cmd2 = new PutObjectCommand({
      Bucket: process.env.AWS_PRIMARY_BUCKET,
      Key: `${req.body._id}/${req.body.imageset}/original/${req.body.index}/${req.body.files[1]}`,
    });

    try {
      const [url1, url2] = await Promise.all([
        await getSignedUrl(s3, cmd1, { expiresIn: 600 }),
        await getSignedUrl(s3, cmd2, { expiresIn: 600 }),
      ]);

      if (url1 && url2) {
        return res.status(200).json([url1, url2]);
      }
    } catch (error) {
      return res.status(500).json("URL generation failed");
    }
  }
};

exports.generateGetPresigned = async (req, res, next) => {
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

      if (!s3Data.results.Contents)
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

exports.generatePortfolioUrls = async (req, res, next) => {
  const verified = validateParams(
    req.params.category,
    req.params.group,
    req.params.size,
    req.params.start,
  );

  if (verified.error) {
    return res.status(400).json(verified.error);
  } else {
    const groupRegex = /\/(\d{3})\//;
    const suffixRegex = `(?<=/${req.params.size}/[^/]+_)\\d{1,3}(?=\\.[^.]+$)`;

    let s3Data = {};
    try {
      // find, filter, and sort objects by their group numbers
      const { objects, stored } = await findFilterSort(
        process.env.AWS_SECONDARY_BUCKET,
        req.params.group,
        `${req.params.category}/${req.params.sub}`,
        groupRegex,
        req.params.size,
      );

      // console.log(objects, stored, "step 1 - find, filter, sort by group")

      if (!objects.Contents) throw new Error({ message: "No files" });

      const suffixSorted = sortBatch(objects.Contents, suffixRegex, groupRegex);

      s3Data.results = suffixSorted;
      s3Data.stored = stored;

      // console.log(s3Data, "step 2 - sort by suffix");
    } catch (error) {
      console.log("error", error);
      return error === "No files"
        ? res.status(200).json({ files: false })
        : res.status(500).json({
            status: true,
            loading: false,
            message:
              "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
          });
    }

    const keys = [];
    for (const obj of s3Data.results) {
      const keyGroup = Number(obj.Key.match(groupRegex)[1]);
      const match = obj.Key.match(suffixRegex);
      const pos = Number(match[0]);

      // skip edge cases which indicate incorrect starting point
      if (keyGroup < req.params.group || !match) continue;
      if (keyGroup >= req.params.group && pos < req.params.start) continue;

      // get the keys you want to generate presigned urls for from the given starting point
      if (pos >= Number(req.params.start)) keys.push(obj.Key);
      if (keys.length === 10) break;
    }

    // console.log(keys, "step 3 - get keys to generate presigns for");

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

    // console.log(presigns, "step 4 - populate presigns array");

    return skipped.length > 0
      ? res.status(200).json({ presigns, keys, skipped, stored: s3Data.stored })
      : res.status(200).json({ presigns, keys, stored: s3Data.stored });
  }
};

exports.countImagesetItems = async (req, res, next) => {
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
          .json({ snapshots: 0, keepsake: 0, core: 0, snips: 0 });

      if (!s3Objects) throw new Error("500");
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    const totals = { snapshots: 0, keepsake: 0, core: 0, snips: 0 };

    for (let i = 0; i < s3Objects.Contents.length; i++) {
      if (s3Objects.Contents[i].Key.includes(req.params.id)) {
        if (s3Objects.Contents[i].Key.includes("snapshots"))
          totals["snapshots"]++;
        else if (s3Objects.Contents[i].Key.includes("keepsake"))
          totals["keepsake"];
        else if (s3Objects.Contents[i].Key.includes("core")) totals["core"];
        else if (s3Objects.Contents[i].Key.includes("socials"))
          totals["socials"];
      }
    }
    return res.status(200).json(totals);
  }
};
