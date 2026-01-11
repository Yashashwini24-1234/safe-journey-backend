import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

console.log("🔑 Gemini Key Loaded:", API_KEY ? "YES" : "NO");

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "Please say or type your question." });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are an AI Safety Assistant for a Safe Journey application in Hyderabad, India.

You must:
- Answer route safety questions
- Explain risky areas clearly
- Give women safety advice
- Be specific and practical
- NEVER reply with "Sorry, I don't understand"

User question:
${userMessage}
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();

    console.log("📦 Gemini raw response:", JSON.stringify(data, null, 2));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.json({
        reply: "I can help with route safety, risky areas, and emergencies. Please ask clearly."
      });
    }

    res.json({ reply });

  } catch (err) {
    console.error("❌ Gemini error:", err);
    res.status(500).json({
      reply: "AI service is temporarily unavailable."
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
