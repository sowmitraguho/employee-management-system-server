const admin = require("firebase-admin");

// ✅ Middleware to verify Firebase Token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: "unauthorized access." });

  const token = authHeader.split(" ")[1];

  try {
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.user = decodedUser; // attach decoded Firebase user info
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error });
  }
  //next();
};

module.exports = verifyFirebaseToken; 