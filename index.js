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

// ✅ Import your user routes
import usersRoutes from "./routes/users.js";


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

     // ✅ Mount user routes
    app.use("/users", usersRoutes(db));

    // GET all employees (role = Employee)
    app.get("/users", async (req, res) => {
      try {
        const role = req.query.role;

        let filter = {};
        if (role) {
          filter.role = role;
        }

        const users = await usersCollection.find(filter).toArray();

        // ✅ Ensure isVerified defaults to false if not present
        const result = users.map(user => ({
          ...user,
          isVerified: user.isVerified || false,
        }));

        res.json(result);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
      }
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

      let works;
      if (email) {
        works = await worksCollection.find({ email }).sort({ assignedDate: -1 }).toArray();
      } else {
        works = await worksCollection.find().sort({ assignedDate: -1 }).toArray();
      }
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

    // GET /payments/:email
    app.get("/payments/:email", async (req, res) => {
      try {
        const { email } = req.params;

        // Pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        // Find the employee document
        const employee = await paymentsCollection.findOne({ email: email });

        if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
        }

        // Extract payment history
        let history = employee.paymentHistory || [];

        // ✅ Sort earliest month/year first
        history.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          const monthsOrder = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
          ];
          return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
        });

        // ✅ Pagination
        const totalCount = history.length;
        const totalPages = Math.ceil(totalCount / limit);
        const startIndex = (page - 1) * limit;
        const paginatedHistory = history.slice(startIndex, startIndex + limit);

        res.json({
          email: employee.email,
          designation: employee.designation,
          payments: paginatedHistory,
          totalPages,
          currentPage: page,
          totalCount
        });

      } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.patch('/users/:id', async (req, res) => {
      const { id } = req.params;
      const { isVerified } = req.body;

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isVerified } }  // if field doesn't exist, it will be created
      );

      res.send(result);
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
