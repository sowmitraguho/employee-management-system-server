const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const router = express.Router();

function usersRoutes(db) {
  const usersCollection = db.collection("users");

  // ✅ GET /users/verified → only verified & not fired
  router.get("/verified", async (req, res) => {
    try {
      const verifiedUsers = await usersCollection
        .find({ isVerified: true })
        .toArray();
      res.json(verifiedUsers);
    } catch (err) {
      console.error("Error fetching verified users:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ✅ PATCH /users/:id/fire → mark user as fired
  router.patch("/:id/fire", async (req, res) => {
    const userId = req.params.id;
    try {
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { status: "fired" } }
      );
      if (result.modifiedCount === 0)
        return res.status(404).json({ message: "User not found" });

      res.json({ message: "User fired successfully" });
    } catch (err) {
      console.error("Error firing user:", err);
      res.status(500).json({ message: "Failed to fire user" });
    }
  });

  // ✅ PATCH /users/:id/makeHR → update role to HR
  router.patch("/:id/makeHR", async (req, res) => {
    const userId = req.params.id;
    try {
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { role: "HR" } }
      );
      if (result.modifiedCount === 0)
        return res.status(404).json({ message: "User not found" });

      res.json({ message: "User promoted to HR" });
    } catch (err) {
      console.error("Error making HR:", err);
      res.status(500).json({ message: "Failed to make HR" });
    }
  });

  // ✅ PATCH /users/:id/salary → update salary
router.patch("/:id/salary", async (req, res) => {
  const userId = req.params.id;
  const { Salary } = req.body;

  if (!Salary || isNaN(Salary)) {
    return res.status(400).json({ message: "Invalid salary" });
  }

  try {
    let result;

    // First try ObjectId
    const isValidObjectId = ObjectId.isValid(userId);
    if (isValidObjectId) {
      result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { Salary: Number(Salary) } }
      );
    }

    // If result didn't update anything, try string ID
    if (!result || result.matchedCount === 0) {
      result = await usersCollection.updateOne(
        { _id: String(userId) },
        { $set: { Salary: Number(Salary) } }
      );
    }

    // If still no user found
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // If salary is same
    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message: "Salary is already the same or no changes were made."
      });
    }

    return res.json({ message: "Salary updated successfully" });

  } catch (err) {
    console.error("Error updating salary:", err);
    return res.status(500).json({ message: "Failed to update salary" });
  }
});


  return router;
}
module.exports = usersRoutes;