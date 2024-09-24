const { verifyTokens } = require("../utils/verifyTokens");
const { s3 } = require("../config/s3");

const {
  PutObjectCommand,
  ListObjectsV2Command,
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

exports.generatePresignedUrl = async (req, res, next) => {
  const verified = await verifyTokens(req, res);

  if (verified) {
    const cmd = new PutObjectCommand({
      Bucket: process.env.AWS_PRIMARY_BUCKET,
      Key: `${req.body._id}/${req.body.imageset}/${req.body.index}/${req.body.filename}`,
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: 600 });
    return res.status(200).json(url);
  }
};
