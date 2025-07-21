const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//const jwt = require('jsonwebtoken');
const admin = require("firebase-admin");
require("dotenv").config();
// ✅ Import your user routes
//import usersRoutes from "./routes/users.js";
const usersRoutes = require("./routes/users");
// ✅ Import payroll routes
const payrollRoutes = require("./routes/payrollRoutes");

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


// ✅ Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
});

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

    // // Example: GET all users
    // app.get("/users", verifyFirebaseToken, async (req, res) => {
    //   const users = await usersCollection.find().toArray();
    //   res.send(users);
    // });



    // GET all employees (role = Employee)
    app.get("/users", verifyFirebaseToken, async (req, res) => {
      try {
        const role = req.query.role;

        const filter = role ? { role } : {};

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
    app.get("/users/:email", verifyFirebaseToken, async (req, res) => {
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



    app.post("/users", async (req, res) => {
      try {
        const user = req.body;

        if (!user || !user.email) {
          return res.status(400).json({ message: "Invalid user data" });
        }

        const result = await usersCollection.insertOne(user);
        res.status(201).json({
          message: "User created successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });



    // GET works for a specific employee by email
    app.get('/works', verifyFirebaseToken, async (req, res) => {
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

      return res.json(result);
    });

    // GET /payments/:email
    app.get("/payments/:email", verifyFirebaseToken, async (req, res) => {
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
          //if (a.year !== b.year) return a.year - b.year;
          if (a.year !== b.year) return b.year - a.year; // latest year first
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

    // ✅ Mount user routes
    app.use("/vfusers", usersRoutes(db));
    // ✅ Use payroll routes
    app.use("/payroll", payrollRoutes(db));


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
