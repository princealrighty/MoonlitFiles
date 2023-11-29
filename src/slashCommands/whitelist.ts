import { config } from 'dotenv';
config();

import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import axios from 'axios';
import { getThemeColor } from '../functions';
import { SlashCommand } from "../types";

const bloxlinkAPIKey = process.env.BLOXLINK_API_KEY || '';
const parcelAPIURL = 'https://papi.parcelroblox.com/whitelist/add';
const parcelAPIKey = process.env.PARCEL_API_KEY || '';
const serverID = process.env.SERVER_ID || '';
const whitelist = ["1040722410070093825", "1095116890361315478", "428925948818227201"];

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('whitelist')
    .addStringOption(option => {
      return option
        .setName("user")
        .setDescription("Discord User ID")
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

    function getProductId(productName: string): string | undefined {
      const productNames: Record<string, string> = {
        "Beginner Bundle": "jmv11xsoerulfnqesuvzppefkdyr",
        "CodeCraft": "ud25jbxr5shnud8qbyitrc6j70jx",
        "Advanced Admin Logger": "qt7zj3codgtw2xyo8aaz6xdsrbrb",
      };

      return productNames[productName];
    }

    const selectedProductID = getProductId(selectedProduct);

    if (!selectedProductID) {
      await interaction.reply("Invalid product name.");
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
          productID: selectedProductID,
          robloxID,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "hub-secret-key": parcelAPIKey,
          },
        }
      );

      const updatedMessage = `Whitelisted player (${robloxID}) for ${selectedProduct}`;
      await interaction.editReply({
        content: updatedMessage,
      });
    } catch (error) {
      if (error.response) {
        console.error("Parcel API error - Status:", error.response.status);
        console.error("Parcel API error - Data:", error.response.data);
      } else if (error.request) {
        console.error("Parcel API error - No response received");
      } else {
        console.error("Parcel API error - Request setup:", error.message);
      }

      await interaction.editReply("Error replying to interaction, server **DOWN**");
    }
  },
  cooldown: 10,
};

export default command;
