const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const askGemini = require("./ai");

const app = express();
app.use(bodyParser.json());

/* ============================
   ENV VARIABLES
============================ */
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "minh";

console.log("🚀 Server starting...");
console.log("🔑 PAGE_ACCESS_TOKEN loaded:", !!PAGE_ACCESS_TOKEN);

/* ============================
   VERIFY WEBHOOK
============================ */
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

/* ============================
   RECEIVE MESSAGES
============================ */
app.post("/webhook", async (req, res) => {
  console.log("📩 Webhook hit");

  const body = req.body;

  if (body.object !== "page") {
    return res.sendStatus(404);
  }

  try {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {

        if (!event.message || !event.message.text) continue;

        const sender = event.sender.id;
        const text = event.message.text.toLowerCase();

        console.log("👤 User:", text);

        let reply;

        // ===== RULE BASED =====
        if (text.includes("giá")) {
          reply = "Giá 199k nha 😎";
        } else if (text.includes("hello") || text.includes("hi")) {
          reply = "Chào bạn 👋";
        } else {
          // ===== AI FALLBACK =====
          reply = await askGemini(text);
        }

        // ===== SEND MESSAGE BACK =====
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

        console.log("🤖 Reply sent:", reply);
      }
    }

    return res.status(200).send("EVENT_RECEIVED");

  } catch (error) {
    console.error(
      "❌ Webhook error:",
      error.response?.data || error.message
    );
    return res.sendStatus(200); // quan trọng để Facebook không resend spam
  }
});

/* ============================
   PRIVACY POLICY
============================ */
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This Messenger bot does not store personal data.</p>
    <p>Data is only used to respond to messages.</p>
  `);
});

/* ============================
   START SERVER
============================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});