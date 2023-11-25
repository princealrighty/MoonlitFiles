import { SlashCommandBuilder, ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { getThemeColor } from '../functions';
import { SlashCommand } from '../types';

const bloxlinkAPIKey = '93d980e9-26a7-4a29-b75b-49dbb0b4e6fe';
const parcelAPIURL = 'https://papi.parcelroblox.com/whitelist/check';
const parcelAPIKey = '5rtwpvrwtkmxnaipbp2ngk5ltizmk819gj60347pro';
const serverID = '1169357319583313952';
const productIDs = ["jmv11xsoerulfnqesuvzppefkdyr", "ud25jbxr5shnud8qbyitrc6j70jx", "qt7zj3codgtw2xyo8aaz6xdsrbrb"];

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('licences')
    .setDescription("Gets the users licences"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction || !interaction.member || !interaction.guild) return;

    try {
      const userPromptEmbed = new EmbedBuilder()
        .setColor('#7CFC00');
      
      const userPrompt = await interaction.reply({ embeds: [userPromptEmbed] });
      let userPromptResolved = false;

      const filter = (m: Message) => m.author.id === interaction.user.id;
      const collector = interaction.channel?.createMessageCollector({ filter, max: 1, time: 15000 });

      collector?.on('collect', async (message: Message) => {
        const discordUserID = message.content;

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
          const results = [];

          for (const productID of productIDs) {
            try {
              const parcelResponse = await axios.post(
                parcelAPIURL,
                {
                  productID,
                  robloxID,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "hub-secret-key": parcelAPIKey,
                  },
                }
              );

              results.push({
                productID,
                success: true,
                data: parcelResponse.data,
              });
            } catch (error) {
              results.push({
                productID,
                success: false,
                error: error.message,
              });
            }
          }

          const embed = new EmbedBuilder()
            .setAuthor({
              name: 'Licences',
            })
            .setColor('#7CFC00')
            .setDescription(`User ID: ${discordUserID}\n\n`);

          for (const result of results) {
            embed.addFields({
              name: `Product ${getProductName(result.productID)}`,
              value: result.success ? "✅" : "❌",
              inline: false,
            });
          }

          await interaction.editReply({ embeds: [embed] });
          userPromptResolved = true;
        } catch (error) {
          console.error("Error resolving Roblox ID from Bloxlink:", error.message);
          await interaction.followUp("Unable to resolve Roblox ID");
        }

        await message.delete();
      });

      collector?.on('end', (collected) => {
        if (collected.size === 0) {
          if (!userPromptResolved) {
            interaction.followUp('No user ID was provided.');
          }
        }
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