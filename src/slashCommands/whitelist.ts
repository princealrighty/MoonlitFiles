import { config } from 'dotenv';
config();

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { getThemeColor } from '../functions';
import { SlashCommand } from "../types";

const bloxlinkAPIKey = process.env.BLOXLINK_API_KEY || '';
const parcelAPIURL = 'https://papi.parcelroblox.com/whitelist/add';
const parcelAPIKey = process.env.PARCEL_API_KEY || '';
const serverID = process.env.SERVER_ID || '';
const productIDs = ["jmv11xsoerulfnqesuvzppefkdyr", "ud25jbxr5shnud8qbyitrc6j70jx", "qt7zj3codgtw2xyo8aaz6xdsrbrb"];
const whitelist = ["1040722410070093825", "1095116890361315478"];

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('whitelist')
    .addStringOption(option => {
      return option
        .setName("user")
        .setDescription("Discord_User_ID")
        .setRequired(true);
    })
    .addStringOption(option => {
      return option
        .setName("product")
        .setDescription("Product name")
        .setRequired(true)
        .setAutocomplete(true);
    })
    .setDescription("Whitelist a user for a specific product"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction || !interaction.member || !interaction.guild) return;

    const discordUserID = interaction.options.getString("user", true);
    const selectedProduct = interaction.options.getString("product", true);

    if (!whitelist.includes(interaction.user.id)) {
      await interaction.reply("You are not authorized to use this command.");
      return;
    }

    try {
      const response = await axios.get(
        `https://api.blox.link/v4/public/guilds/${serverID}/discord-to-roblox/${discordUserID}`,
        {
          headers: {
            Authorization: bloxlinkAPIKey,
          },
        }
      );

      const { robloxID } = response.data;

      const ackMessage = await interaction.reply("Whitelisting in progress...");

      await axios.post(
        parcelAPIURL,
        {
          productID: selectedProduct,
          robloxID,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "hub-secret-key": parcelAPIKey,
          },
        }
      );

      const updatedMessage = `Whitelisted player ${discordUserID} for ${getProductName(selectedProduct)}`;
      await interaction.editReply({
        content: updatedMessage,
        embeds: [],
      });
    } catch (error) {
      console.error("Error replying to interaction:", error.message);
    }
  },
  cooldown: 10,
};

function getProductName(productID: string): string {
  const productNames: Record<string, string> = {
    "jmv11xsoerulfnqesuvzppefkdyr": "Starter",
    "ud25jbxr5shnud8qbyitrc6j70jx": "CodeCraft",
    "qt7zj3codgtw2xyo8aaz6xdsrbrb": "Advanced admin logger",
  };

  return productNames[productID] || productID;
}

export default command;
