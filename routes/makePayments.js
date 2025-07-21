// routes/payroll.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// ✅ Load Stripe secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create Payment Intent route
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, employeeId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe requires amount in cents
      currency: currency || "usd",
      metadata: { employeeId },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Mark payroll as paid (after successful payment)
router.post("/mark-paid", async (req, res) => {
  const { employeeId, paymentId } = req.body;

  // Example: Update your DB payroll table (MongoDB example)
  // await Payroll.updateOne({ employeeId }, { status: "paid", paymentId, paidAt: new Date() });

  res.json({ success: true, message: "Payroll marked as paid." });
});

module.exports = router;
