const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//cors setup
const allowedOrigins = [
  "http://localhost:5173"  // ✅ Local frontend
  //"https://your-frontend-domain.com" // ✅ Production frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // ✅ allow cookies/auth headers
  })
);



// Middleware
app.use(express.json());

// DB Connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const db = client.db("emsDB");
    const worksCollection = db.collection("works");
    const usersCollection = db.collection("users");

    // Default route
    app.get("/", (req, res) => {
      res.send("Employee Management API Running");
    });

    // Example: GET all users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    // Get users by email
    app.get("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;

        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        const user = await usersCollection.findOne({ email });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });



    // Example: POST a new user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });


    // GET works for a specific employee by email
    app.get('/works', async (req, res) => {
      const email = req.query.email;
      const works = await worksCollection.find({ email }).sort({ assignedDate: -1 }).toArray();
      res.send(works);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


  } finally {
    // client will remain open for long-running server
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
