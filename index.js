const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const event = req.body.event;
  const messageText = event?.message?.content;
  const chatId = event?.message?.chat_id;

  if (messageText && chatId) {
    try {
      const gptRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: messageText }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = gptRes.data.choices[0].message.content;

      await axios.post(
        "https://open.larksuite.com/open-apis/im/v1/messages",
        {
          receive_id_type: "chat_id",
          receive_id: chatId,
          msg_type: "text",
          content: JSON.stringify({ text: reply }),
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.LARK_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
    }
  }

  res.send("ok");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
