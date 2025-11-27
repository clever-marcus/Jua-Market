import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import callbackRouter from "./routes/callback.js";
import mpesaRoutes from "./routes/mpesa.js";
import stripeRoutes from "./stripe.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/stripe", stripeRoutes);
app.use("/mpesa", mpesaRoutes);
app.use("/mpesa/callback", callbackRouter);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
