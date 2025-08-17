const express = require("express");
const { ObjectId } = require("mongodb");
const verifyFirebaseToken = require("../middlewires/firebaseAuth");

const router = express.Router();

function contentRoutes(db) {
  const contentCollection = db.collection("homepageData");

  //  Get all content (whyChooseUs, logos, services, projects, etc.)
  router.get("/", async (req, res) => {
    try {
      const content = await contentCollection.findOne();
      if (!content) {
        return res.status(404).json({ message: "No content found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  //  Insert initial content (JSON file)
  router.post("/", verifyFirebaseToken, async (req, res) => {
    try {
      const newContent = req.body;
      const result = await contentCollection.insertOne(newContent);
      res.json(result);
    } catch (error) {
      console.error("Error inserting content:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  //  Update content (replace whole document or specific section)
  router.patch("/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const result = await contentCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );

      res.json(result);
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}

module.exports = contentRoutes;
