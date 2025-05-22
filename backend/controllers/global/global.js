const { verifyTokens } = require("../utils/verifyTokens");
const { s3 } = require("../config/s3");

const {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
      console.log(error, "URL generation failed");
      return res.status(500).json("URL generation failed");
    }
  }
};

exports.generateGetPresigned = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    // retrieve all S3 objects
    const indexRegex = /\/(\d{1,3})\//;
    let s3Data = {};
    try {
      let objects = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: `${req.params.id}/${req.params.imageset}`,
        })
      );

      const sorted = objects.Contents.filter((item) =>
        item.Key.includes("/sm/")
      ).sort((a, b) => {
        const posA = a.Key.match(indexRegex);
        const posB = b.Key.match(indexRegex);

        if (Number(posA[1]) < Number(posB[1])) return -1;
        if (Number(posA[1]) > Number(posB[1])) return 1;
        return 0;
      });

      objects.Contents = sorted;
      s3Data.results = objects;
      s3Data.stored = sorted.length;

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

exports.countImagesetItems = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    // retrieve all S3 objects
    let s3Objects;
    try {
      s3Objects = await s3.send(
        new ListObjectsV2Command({ Bucket: process.env.AWS_PRIMARY_BUCKET })
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
        else if (s3Objects.Contents[i].Key.includes("snips")) totals["snips"];
      }
    }
    return res.status(200).json(totals);
  }
};
