function usersRoutes(db) {
  const router = express.Router();  // ✅ Move inside function
  const usersCollection = db.collection("users");

  // ✅ GET /verified
  router.get("/verified", verifyFirebaseToken, async (req, res) => {
    try {
      const verifiedUsers = await usersCollection.find({ isVerified: true }).toArray();
      res.json(verifiedUsers);
    } catch (err) {
      console.error("Error fetching verified users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ✅ PATCH /:id/fire
  router.patch("/:id/fire", verifyFirebaseToken, async (req, res) => {
    const userId = req.params.id;
    try {
      let result;

      if (ObjectId.isValid(userId)) {
        result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { status: "fired" } }
        );
      }

      if (!result || result.matchedCount === 0) {
        result = await usersCollection.updateOne(
          { _id: String(userId) },
          { $set: { status: "fired" } }
        );
      }

      if (result.matchedCount === 0) return res.status(404).json({ message: "User not found" });
      if (result.modifiedCount === 0) return res.status(200).json({ message: "User is already fired" });

      return res.json({ message: "User fired successfully" });
    } catch (err) {
      console.error("Error firing user:", err);
      return res.status(500).json({ message: "Failed to fire user" });
    }
  });

  // ✅ PATCH /:id/makeHR
  router.patch("/:id/makeHR", verifyFirebaseToken, async (req, res) => {
    const userId = req.params.id;
    try {
      let result;

      if (ObjectId.isValid(userId)) {
        result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role: "hr" } }
        );
      }

      if (!result || result.matchedCount === 0) {
        result = await usersCollection.updateOne(
          { _id: String(userId) },
          { $set: { role: "hr" } }
        );
      }

      if (result.matchedCount === 0) return res.status(404).json({ message: "User not found" });
      if (result.modifiedCount === 0) return res.status(200).json({ message: "User is already HR" });

      return res.json({ message: "User promoted to HR" });
    } catch (err) {
      console.error("Error making HR:", err);
      return res.status(500).json({ message: "Failed to make HR" });
    }
  });

  // ✅ PATCH /:id/salary
  router.patch("/:id/salary", verifyFirebaseToken, async (req, res) => {
    const userId = req.params.id;
    const { Salary } = req.body;

    if (!Salary || isNaN(Salary)) {
      return res.status(400).json({ message: "Invalid salary" });
    }

    try {
      let result;

      if (ObjectId.isValid(userId)) {
        result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { Salary: Number(Salary) } }
        );
      }

      if (!result || result.matchedCount === 0) {
        result = await usersCollection.updateOne(
          { _id: String(userId) },
          { $set: { Salary: Number(Salary) } }
        );
      }

      if (result.matchedCount === 0) return res.status(404).json({ message: "User not found" });
      if (result.modifiedCount === 0) return res.status(200).json({ message: "Salary already same" });

      return res.json({ message: "Salary updated successfully" });
    } catch (err) {
      console.error("Error updating salary:", err);
      return res.status(500).json({ message: "Failed to update salary" });
    }
  });

  return router;
}

module.exports = usersRoutes;
