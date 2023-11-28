import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the bot's ping"),
  execute: (interaction) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "Command Ran: /ping" })
          .setTitle(`US: License Bot Ping`)
          .setDescription(`Unfortunately, I cannot play Ping Pong! But heres my Latency! \n \n 🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
          .setColor(getThemeColor("text"))
          .setFooter({ text: "Unified Licensing" }),
      ],
    });
  },
  cooldown: 10,
};

export default command;
