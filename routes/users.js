const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const verifyFirebaseToken = require("../middlewires/firebaseAuth");
const router = express.Router();

function usersRoutes(db) {
  const usersCollection = db.collection("users");

  // ✅ GET /users/verified → only verified & not fired
  router.get("/verified", verifyFirebaseToken, async (req, res) => {
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
router.patch("/:id/fire", verifyFirebaseToken, async (req, res) => {
  const userId = req.params.id;

  try {
    let result;

    // ✅ Try ObjectId first if it's a valid format
    const isValidObjectId = ObjectId.isValid(userId);
    if (isValidObjectId) {
      result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { status: "fired" } }
      );
    }

    // ✅ If no match, try plain string ID
    if (!result || result.matchedCount === 0) {
      result = await usersCollection.updateOne(
        { _id: String(userId) },
        { $set: { status: "fired" } }
      );
    }

    // ✅ Still no user found
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ User exists but status is already "fired"
    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "User is already fired" });
    }

    // ✅ Successfully updated
    return res.json({ message: "User fired successfully" });

  } catch (err) {
    console.error("Error firing user:", err);
    return res.status(500).json({ message: "Failed to fire user" });
  }
});


  // ✅ PATCH /users/:id/makeHR → update role to HR


  router.patch("/:id/makeHR", verifyFirebaseToken, async (req, res) => {
    const userId = req.params.id;

    try {
      let result;

      // ✅ First try ObjectId if valid
      const isValidObjectId = ObjectId.isValid(userId);
      if (isValidObjectId) {
        result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role: "hr" } }
        );
      }

      // ✅ If no match with ObjectId, try as plain string ID
      if (!result || result.matchedCount === 0) {
        result = await usersCollection.updateOne(
          { _id: String(userId) },
          { $set: { role: "hr" } }
        );
      }

      // ✅ Still no match? User not found
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // ✅ User exists but role was already HR
      if (result.modifiedCount === 0) {
        return res.status(200).json({ message: "User is already HR" });
      }

      // ✅ Success
      return res.json({ message: "User promoted to HR" });

    } catch (err) {
      console.error("Error making HR:", err);
      return res.status(500).json({ message: "Failed to make HR" });
    }
  });


  // ✅ PATCH /users/:id/salary → update salary okokdffdsa
  router.patch("/:id/salary", verifyFirebaseToken, async (req, res) => {
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