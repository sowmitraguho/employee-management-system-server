const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const paymentsCollection = db.collection("paymenthistory");

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
      console.log("Query email:", email); // <-- Debug log

      const works = await worksCollection.find({ email }).sort({ assignedDate: -1 }).toArray();
      console.log("Found works:", works.length); // <-- Debug log

      res.send(works);
    });




    // ✅ DELETE work by ID
    app.delete("/works/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid work ID" });
        }

        const result = await worksCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Work not found" });
        }

        res.json({ success: true, message: "Work deleted successfully" });
      } catch (error) {
        console.error("Delete work error:", error);
        res.status(500).json({ error: "Failed to delete work" });
      }
    });



    //post works by employee
    app.post("/works", async (req, res) => {
      const newWork = req.body;
      const result = await worksCollection.insertOne(newWork);
      res.json(result);
    });

    //update work
    app.put("/works/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      console.log(updatedData);
      const result = await worksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );

      res.json(result);
    });

    //payment 
    // GET /payments/:email
    app.get("/payments/:email", async (req, res) => {
      const { email } = req.params;
      // const page = parseInt(req.query.page) || 1;
      // const limit = parseInt(req.query.limit) || 5;
      // const skip = (page - 1) * limit;

      const totalCount = await paymentsCollection.countDocuments({ employeeEmail: email });

      // const payments = await paymentsCollection
      //   .find({ employeeEmail: email })
      //   .sort({ year: 1, month: 1 }) // earliest month first
      //   .skip(skip)
      //   .limit(limit)
      //   .toArray();

      const payments = await paymentsCollection.find({ employeeEmail: email }).toArray();
      res.json({
        payments,
        //totalPages: Math.ceil(totalCount / limit),
        //currentPage: page,
      });
    });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");


  } finally {
    // client will remain open for long-running server
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
