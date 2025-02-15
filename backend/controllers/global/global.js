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
    let s3Objects;
    try {
      let objects = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Prefix: `${req.params.id}/${req.params.imageset}/resized`,
        })
      );

      const sorted = objects.Contents.sort((a, b) => {
        const posA = a.Key.match(indexRegex);
        const posB = b.Key.match(indexRegex);

        if (Number(posA[1]) < Number(posB[1])) return -1;
        if (Number(posA[1]) > Number(posB[1])) return 1;
        return 0;
      });
      objects.Contents = sorted;
      s3Objects = objects;

      if (!s3Objects.Contents) return res.status(200).json({ files: false });
    } catch (error) {
      if (typeof s3Objects === "undefined")
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
    for (let i = 0; i < s3Objects.Contents.length; i++) {
      const position = s3Objects.Contents[i].Key.match(indexRegex);
      if (
        // s3Objects.Contents[i].Key.includes(req.params.imageset) &&
        // s3Objects.Contents[i].Key.includes(req.params.id) &&
        Number(position[1]) >= Number(req.params.start) && // this ensures we will always pick up from where we left off when a new batch has been requested
        Number(position[1]) <= Number(req.params.end) // ensures "out-of-bounds" presigns aren't included
      ) {
        const cmd = new GetObjectCommand({
          Bucket: process.env.AWS_PRIMARY_BUCKET,
          Key: s3Objects.Contents[i].Key,
        });

        let url = "";
        try {
          url = await getSignedUrl(s3, cmd, { expiresIn: 600 });
          if (!url) throw new Error("500");
        } catch (error) {
          // populate an array to transmit to client if signed url generation fails
          const constituents = s3Objects.Contents[i].Key.split("/");
          const filename = constituents.pop();
          skipped.push(filename);
          continue;
        }

        presigns.push(url);
      }

      if (presigns.length === 10) break;
    }

    return skipped.length > 0
      ? res.status(200).json({ presigns, skipped })
      : res.status(200).json({ presigns });
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
          .json({ previews: 0, full: 0, socials: 0, snips: 0 });

      if (!s3Objects) throw new Error("500");
    } catch (error) {
      return res.status(500).json({
        status: true,
        message:
          "There was an error retrieving your images from S3. Please refresh the page and try again. Let Jack know if the problem persists!",
        logout: { status: false, path: null },
      });
    }

    const totals = { previews: 0, full: 0, socials: 0, snips: 0 };

    for (let i = 0; i < s3Objects.Contents.length; i++) {
      if (s3Objects.Contents[i].Key.includes(req.params.id)) {
        if (s3Objects.Contents[i].Key.includes("previews"))
          totals["previews"]++;
        else if (s3Objects.Contents[i].Key.includes("full")) totals["full"];
        else if (s3Objects.Contents[i].Key.includes("socials"))
          totals["socials"];
        else if (s3Objects.Contents[i].Key.includes("snips")) totals["snips"];
      }
    }
    return res.status(200).json(totals);
  }
};
