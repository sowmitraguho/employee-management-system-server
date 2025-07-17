const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const router = express.Router();

function payrollRoutes(db) {
    const payrollCollection = db.collection("payroll");
    const usersCollection = db.collection("users");

    // ✅ HR sends payroll request
    router.post("/request", async (req, res) => {
        try {
            const requestData = req.body;
            const paidId = requestData.employeeId;
            
            let employee;
            const isValidObjectId = ObjectId.isValid(paidId);
            if (isValidObjectId) {
                employee = await usersCollection.find({ _id: new ObjectId(paidId) });
            }

            // ✅ If not found, also try plain string match
            if (!employee) {
                employee = await usersCollection.findOne({ _id: paidId });
            }

            if (!employee) {
                return res.status(404).json({ message: `Employee not found ${paid}` });
            }
            const { employeeId, ...paidEmployee } = employee;
            const payrollData = { ...paidEmployee, createdAt: new Date() };

            const result = await payrollCollection.insertOne(payrollData);
            return res.json(result);
        } catch (error) {
            console.error("Error creating payroll request:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    // ✅ Admin approves/rejects payroll
    router.patch("/:id", async (req, res) => {
        try {
            const { status } = req.body;
            const id = req.params.id;

            const result = await payrollCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        status,
                        approvedBy: "admin@example.com", // ✅ Replace with logged-in Admin
                        approvedAt: new Date(),
                    },
                }
            );

            res.json(result);
        } catch (error) {
            console.error("Error updating payroll status:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    // ✅ Get all payroll requests
    router.get("/", async (req, res) => {
        try {
            const payrolls = await payrollCollection.find().toArray();
            return res.json(payrolls);
        } catch (error) {
            console.error("Error fetching payroll data:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    return router;
}

module.exports = payrollRoutes;
