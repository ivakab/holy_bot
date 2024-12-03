require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const webAppUrl = "https://timely-klepon-13b89e.netlify.app";

const bot = new TelegramBot(process.env.BOT_API_TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Fill form below", {
      reply_markup: {
        keyboard: [
          [{ text: "Fill form", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });

    await bot.sendMessage(chatId, "Let`s go", {
      reply_markup: {
        inline_keyboard: [[{ text: "Add order", web_app: { url: webAppUrl } }]],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(chatId, "Good");
      await bot.sendMessage(chatId, "Your country: " + data?.country);
      await bot.sendMessage(chatId, "Your street: " + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(chatId, "Here");
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, products = [], totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Successful",
      input_message_content: {
        message_text: ` Summ  ${totalPrice}, ${products
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
