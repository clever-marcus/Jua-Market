import axios from "axios";
import base64 from "base-64";
import dotenv from "dotenv";
import express from "express";
import moment from "moment";

dotenv.config();

const router = express.Router();

router.post("/stkpush", async (req, res) => {
  const { phone, amount } = req.body;

  const formattedPhone = phone.startsWith("0") ? "254" + phone.substring(1) : phone;

  const timestamp = moment().format("YYYYMMDDHHmmss");

  const password = base64.encode(
    process.env.BUSINESS_SHORTCODE + process.env.PASSKEY + timestamp
  );

  try {
    // get oauth token
    const token = await generateToken();

    // mpesa stk push request
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.BUSINESS_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: "JuaMarket",
        TransactionDesc: "Checkout payment",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json({ ok: true, ...response.data });
  } catch (err) {
    console.log("STK Error:", err.response?.data || err.message);
    res.status(500).json({ ok: false, message: "Mpesa STK failed", error: err.message });
  }
});

async function generateToken() {
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      auth: {
        username: process.env.CONSUMER_KEY,
        password: process.env.CONSUMER_SECRET,
      },
    }
  );

  return res.data.access_token;
}

export default router;
