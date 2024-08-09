const jwt = require("jsonwebtoken");

exports.verifyTokens = async (req, res) => {
  let decodedAccess;
  try {
    decodedAccess = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET);
  } catch (err) {
    let decodedRefresh;
    try {
      decodedRefresh = jwt.verify(
        req.cookies.refreshToken,
        process.env.JWT_SECRET
      );
    } catch (err) {
      return res
        .status(401)
        .json({ status: 401, message: "Refresh token expired." });
    }

    if (decodedRefresh.exp > 0) {
      // create new access token
      decodedAccess = jwt.sign(
        { _id: decodedRefresh._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // attach new access token to response cookie
      res.cookie("accessToken", decodedAccess, {
        httpOnly: true,
        sameSite: "Strict",
        secure: true,
      });
    }
  }

  return decodedAccess;
};
