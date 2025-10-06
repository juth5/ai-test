import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

// Node.jsの標準モジュールでディレクトリ取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// JSONを扱えるようにする（必須）
app.use(express.json());
// ✅ publicフォルダを静的配信（JSやCSSを返せるようにする）
app.use(express.static(path.join(__dirname, "public")));
// "/" にアクセスが来たら index.html を返す
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});



// ✅ フロントから呼び出すAPIエンドポイント
app.post("/api/chat", async (req, res) => {
  try {
    const { text } = req.body;
    const { model } = req.body;
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: text }],
      }),
    });

    const data = await openaiRes.json();

    const reply = data.choices?.[0]?.message?.content || "（応答を取得できませんでした）";
    res.json({ reply }); // フロントに返す

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバー側でエラーが発生しました。" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
