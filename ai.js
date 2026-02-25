const API_KEY = process.env.GEMINI_API_KEY;

async function askGemini(message) {
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a friendly Vietnamese sales assistant.
Reply short (max 80 words).
Be polite and helpful.

User: ${message}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, hiện tại hệ thống đang bận."
    );
  } catch (err) {
    console.error("Gemini error:", err);
    return "Xin lỗi, hệ thống đang gặp lỗi.";
  }
}

module.exports = askGemini;