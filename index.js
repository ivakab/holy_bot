require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const webAppUrl = "https://holycakes.shop";
// const webAppUrl = "https://timely-klepon-13b89e.netlify.app";
const PORT = 8000;

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

app.post("/api/web-data", async (req, res) => {
  const { queryId, products, user } = req.body;
  const username = user?.username;

  const productList = products
    .map(
      (product, index) =>
        `${index + 1}. Product: ${product.productKey}, Date: ${product.date}`
    )
    .join("\n");

  const messageForCustomer = `Your order:\n${productList}.\nCheck your username: ${username}`;
  const messageForAdmin = `New order from @${username}:\n${productList}`;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Successful",
      input_message_content: {
        message_text: messageForCustomer,
      },
    });
    await bot.sendMessage(242766311, messageForAdmin);

    return res.status(200).json({ message: "Request processed successfully" });
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Failed",
      input_message_content: {
        message_text: `Failed`,
      },
    });
    return res.status(500).json({ message: "Request failed" });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log("server started on PORT " + PORT)
);
