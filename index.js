const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// 🔐 DÁN TOKEN THẬT CỦA M VÀO ĐÂY
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// 🔑 TỰ ĐẶT (phải giống trong Meta webhook)
const VERIFY_TOKEN = "minh";


// ============================
// 1️⃣ Verify webhook
// ============================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});


// ============================
// 2️⃣ Nhận tin nhắn
// ============================
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    const entry = body.entry[0];
    const event = entry.messaging[0];

    if (event.message && event.message.text) {
      const sender = event.sender.id;
      const text = event.message.text.toLowerCase();

      console.log("User message:", text);

      let reply = "T chưa hiểu 🤖";

      if (text.includes("giá")) {
        reply = "Giá 199k nha 😎";
      }

      if (text.includes("hello") || text.includes("hi")) {
        reply = "Chào bạn 👋";
      }

      // Gửi tin nhắn lại
      await axios.post(
        `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        {
          recipient: { id: sender },
          message: { text: reply },
        }
      );
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  res.sendStatus(404);
});


// ============================
// 3️⃣ Start server
// ============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});