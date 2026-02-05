// middleware/verifyToken.js

/**
 * Dummy verifyToken middleware
 * ----------------------------------------------------
 * This is a placeholder authentication middleware
 * used for demo / open-source version of the project.
 *
 * Replace with real JWT verification in production.
 */

const verifyToken = (req, res, next) => {
  try {
    // Read token from headers
    const token = req.headers.token;
    const email = req.headers.emailid;

    // ---- Dummy validation ----
    if (!token || !email) {
      return res.status(401).json({
        auth: false,
        message: "Missing authentication headers"
      });
    }

    // ---- Mock user injection ----
    req.user = {
      email: email,
      role: "DemoUser"
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    res.status(500).json({
      auth: false,
      message: "Authentication error"
    });
  }
};

module.exports = verifyToken;
