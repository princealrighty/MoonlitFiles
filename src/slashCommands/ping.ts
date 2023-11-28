import { SlashCommandBuilder, ChannelType, TextChannel, EmbedBuilder } from "discord.js"
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command : SlashCommand = {
    command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the bot's ping")
    ,
    execute: interaction => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({name: "Command Ran: /ping"})
                .setTitle(`US: License Bot Ping`)
                .setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
                .setColor(getThemeColor("text"))
                .setFooter(`Unified Licensing`)
            ]
        })
    },
    cooldown: 10
}

export default command
