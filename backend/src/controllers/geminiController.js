import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash"; // or gemini-1.5-pro

export const geminiChat = async (req, res) => {
  try {
    const { message, system } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        ...(system
          ? [
              {
                role: "user",
                parts: [{ text: `System instruction: ${system}` }],
              },
            ]
          : []),
        { role: "user", parts: [{ text: message }] },
      ],
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res
        .status(r.status)
        .json({ error: "Gemini API error", details: errText });
    }

    const json = await r.json();
    const reply =
      json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I don't have a response.";

    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};
