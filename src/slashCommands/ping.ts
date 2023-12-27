import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Caluclates & Fetches The Bots Ping"),
  execute: (interaction) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "Command Ran: /ping" })
          .setTitle(`MS: License Bot Ping`)
          .setDescription(`Unfortunately, I cannot play Ping Pong! But heres my Latency! \n \n 🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
          .setColor(getThemeColor("text"))
          .setFooter({ text: Moonlit Files" }),
      ],
    });
  },
  cooldown: 10,
};

export default command;
