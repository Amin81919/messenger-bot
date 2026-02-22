const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// ============================
// 🔐 ENV VARIABLES
// ============================
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "minh";

// ============================
// 1️⃣ VERIFY WEBHOOK
// ============================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// ============================
// 2️⃣ RECEIVE MESSAGES
// ============================
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {

    for (const entry of body.entry) {
      for (const event of entry.messaging) {

        if (event.message && event.message.text) {
          const sender = event.sender.id;
          const text = event.message.text.toLowerCase();

          console.log("📩 From:", sender);
          console.log("💬 Message:", text);

          let reply = "T chưa hiểu 🤖";

          if (text.includes("hello") || text.includes("hi")) {
            reply = "Chào bạn 👋";
          }

          if (text.includes("giá")) {
            reply = "Giá 199k nha 😎";
          }

          try {
            await axios.post(
              "https://graph.facebook.com/v17.0/me/messages",
              {
                recipient: { id: sender },
                message: { text: reply },
              },
              {
                params: { access_token: PAGE_ACCESS_TOKEN },
              }
            );
          } catch (error) {
            console.error(
              "❌ Send error:",
              error.response?.data || error.message
            );
          }
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  res.sendStatus(404);
});

// ============================
// 🔐 PRIVACY POLICY (FOR REVIEW)
// ============================
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This Messenger bot does not store personal data.</p>
    <p>Data is only used to respond to messages.</p>
  `);
});

// ============================
// 🚀 START SERVER
// ============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
