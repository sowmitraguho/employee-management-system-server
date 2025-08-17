const express = require("express");
const { ObjectId } = require("mongodb");
const verifyFirebaseToken = require("../middlewires/firebaseAuth");

const router = express.Router();

function contentRoutes(db) {
  const contentCollection = db.collection("homepagedata");

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
  router.patch("/:item", verifyFirebaseToken, async (req, res) => {
    try {
      const item = req.params.item; 
      const updates = req.body;

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No update data provided" });
      }

      // Update the field dynamically
      const result = await contentCollection.updateOne(
        {}, 
        { $set: { item: updates } }
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
