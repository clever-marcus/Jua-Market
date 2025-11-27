import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";

dotenv.config();
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-intent", async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // Stripe requires amount in CENTS
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { orderId },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Stripe error", error: err.message });
  }
});

export default router;
