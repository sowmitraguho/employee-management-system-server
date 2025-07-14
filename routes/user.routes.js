const express = require("express");
const router = express.Router();

module.exports = function (usersCollection) {
  // POST /users → Add or update user
  router.post("/", async (req, res) => {
    try {
      const { email, name, photoURL, role, salary, designation, performanceReview, status } = req.body;

      if (!email || !name || !role) {
        return res.status(400).json({ message: "Email, name, and role are required" });
      }

      const user = {
        email,
        name,
        photoURL: photoURL || "",
        role,
        salary: salary || 0,
        designation: designation || "",
        performanceReview: performanceReview || "",
        status: status || "active",
      };

      const result = await usersCollection.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );

      res.send({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};
