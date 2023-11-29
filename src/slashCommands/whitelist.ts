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
const whitelist = ["1040722410070093825", "1095116890361315478"];

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

    // Function to get the product ID based on the product name
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
      // Handle the case where the product name is not recognized
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

      const updatedMessage = `Whitelisted player (${discordUserID}) for ${selectedProduct}`;
      await interaction.editReply({
        content: updatedMessage,
      });
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Parcel API error - Status:", error.response.status);
        console.error("Parcel API error - Data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Parcel API error - No response received");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Parcel API error - Request setup:", error.message);
      }

      await interaction.editReply("Error replying to interaction, server **DOWN**");
    }
  },
  cooldown: 10,
};

<<<<<<< HEAD
=======
function getProductName(productID: string): string {
  const productNames: Record<string, string> = {
    "jmv11xsoerulfnqesuvzppefkdyr": "Beginner Bundle",
    "ud25jbxr5shnud8qbyitrc6j70jx": "CodeCraft",
    "qt7zj3codgtw2xyo8aaz6xdsrbrb": "Advanced Admin Logger",
  };

  return productNames[productID] || productID;
}

>>>>>>> ab141a626b39581b2394622db9a9951118581bea
export default command;
