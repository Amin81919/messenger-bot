const API_KEY = "AIzaSyBhJNSwkOtaO6vAQ9-3XK6AUv1Y2rKGSOY";

async function test() {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Xin chào, bạn là ai?" }]
          }
        ]
      })
    }
  );

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();