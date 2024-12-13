require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

// const webAppUrl = "https://timely-klepon-13b89e.netlify.app";
const webAppUrl = "https://6753-87-116-133-109.ngrok-free.app";

const bot = new TelegramBot(process.env.BOT_API_TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "You can use this app for orders", {
      reply_markup: {
        inline_keyboard: [[{ text: "Open", web_app: { url: webAppUrl } }]],
      },
    });
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, info = [], sum } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Successful",
      input_message_content: {
        message_text: `Info  ${sum}, ${info
          .map((item) => item.title)
          .join(", ")}`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    return res.status(500).json({});
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log("server started on PORT " + PORT));
