const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      req.body.userId = decoded.userId;
      req.body.userEmail = decoded.userEmail;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = verifyToken;
