require("dotenv/config");
const { Configuration, OpenAIApi } = require("openai");
const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("ready", () => {
  console.log("The bot is now running!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== process.env.DISCORD_CHANNEL_ID) return;

  try {
    await message.channel.sendTyping();

    let previousMessages = await message.channel.messages.fetch({ limit: 15 });
    previousMessages.reverse();

    let conversationLog = [
      { role: "system", content: "You are a friendly chatbot!" },
    ];

    previousMessages.forEach((msg) => {
      if (msg.author.id !== client.user.id && msg.author.bot) return;
      conversationLog.push({
        role: "user",
        content: msg.content,
      });
    });

    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationLog,
    });

    message.reply(result?.data?.choices[0]?.message);
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
});

client.login(process.env.TOKEN);
