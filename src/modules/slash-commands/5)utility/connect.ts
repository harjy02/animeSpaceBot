import {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
   Message,
   MessageButton,
   MessageEmbed,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import { ButtonRow } from "lib/discordComponents/button";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { anilistUrl } from "assets/reference";
import { getAlUserInfo } from "lib/commands/connect/connect";
import { getUserIndex } from "lib/commands/media/mediaIndex/userIndex";
import { parseJson } from "lib/tools/text/parseJson";
import { setComponent } from "lib/discordComponents/component";
import { textTruncate } from "lib/tools/text/textTruncate";
import { getAuthData, removeAuthData } from "cluster/anilist/libs/authData";
import { setUserData } from "cluster/anilist/libs/userData";
import { findOrCreateDiscordUser } from "cluster/anilist/libs/discordUser";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";
import { supportServerInviteLink } from "assets/config";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `This command allows you to connect an :anilist: profile and use commands that require it`,
      usage: `to use this command just run it by using as argument your :anilist: username or id`,
      structure: "/anime <:anilist: username or id>",
      example: "`/connect kyros` or `/connect 244820`",
   },
   arguments: [
      {
         name: "anilist_username",
         description: "The name of the anilist user to connect with",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const responseObj = parseJson<UserTitleValue>(
         interaction.options.getString("anilist_username")!,
      );

      if (responseObj) {
         //#region [args]

         const guild =
            interaction.channel?.type === "DM"
               ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
               : interaction.guild;
         const author = interaction.user;
         const id = responseObj[0];

         //#endregion

         if (!guild)
            return interaction.reply("this command can only be executed in a guild");
         const userInfo = await getAlUserInfo(String(id));

         if (userInfo === "n/a") {
            const embed = new MessageEmbed()
               .setTitle("Not found")
               .setDescription(
                  `Sorry but i didn't find any **${anilistUrl}** user with that username/id, try again and check if you wrote it correctly`,
               );

            return interaction.reply({ embeds: [embed] });
         } else {
            const embed = new MessageEmbed()
               .setTitle("Account connection")
               .setThumbnail(userInfo.avatar.large)
               .setDescription(
                  `**Username:** [${userInfo.name}](${userInfo.siteUrl})\n**id:** [${userInfo.id}](${userInfo.siteUrl})\n\nIs this the user you want to associate to your discord account?`,
               );

            const buttonRow = new ButtonRow([connectButton, exitButton]);

            const sent = (await interaction.reply({
               embeds: [embed],
               components: setComponent(buttonRow),
               fetchReply: true,
               ephemeral: true,
            })) as Message;

            const collector = sent.createMessageComponentCollector();

            collector.on("collect", async (collectInteraction) => {
               if (collectInteraction.user.id !== author.id) {
                  return collectInteraction.reply({
                     content: "This interaction is not for you..",
                     ephemeral: true,
                  });
               }

               switch (collectInteraction.customId) {
                  case "connect": {
                     const discordGuild = await findOrCreateDiscordGuild(guild);
                     const discordUser = await findOrCreateDiscordUser(author);

                     const existingAuthData = await getAuthData(guild.id, author.id);
                     if (existingAuthData) {
                        const removed = removeAuthData(existingAuthData);

                        if (!removed) {
                           return collectInteraction.update({
                              embeds: [
                                 embed.setDescription(
                                    `there were some problems, if this happens again report it in the [support server](${supportServerInviteLink})`,
                                 ),
                              ],
                              components: [],
                           });
                        }
                     }

                     await setUserData(
                        discordGuild,
                        discordUser,
                        userInfo.name,
                        `${userInfo.id}`,
                     );

                     collectInteraction.update({
                        embeds: [
                           embed.setDescription(
                              `Success!\nYour discord account is now connected to the user [${userInfo.name}](${userInfo.siteUrl})`,
                           ),
                        ],
                        components: [],
                     });

                     return collector.stop("ok");
                  }
                  case "exit": {
                     collectInteraction.update({
                        embeds: [
                           new MessageEmbed().setDescription(`Connection cancelled`),
                        ],
                        components: [],
                     });
                     return collector.stop("ok");
                  }
               }
            });
         }
      } else {
         return interaction.reply(
            "You need to select an element from the list of names that appears while typing the user name",
         );
      }
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const userIndex = await getUserIndex(
            interaction.options.getFocused(true).value as string,
            8,
         );

         if (userIndex) {
            userIndex.forEach((value) => {
               const appValue: UserTitleValue = [value.id];

               applicationChoice.push({
                  name: textTruncate(value.name, 50),
                  value: JSON.stringify(appValue),
               });
            });
         }

         interaction.respond(applicationChoice);
      } catch (error: any) {
         this.catchAutocompleteError(error);
      }
   }
}

type UserTitleValue = [id: number];

const connectButton = new MessageButton()
   .setCustomId("connect")
   .setLabel("Connect")
   .setStyle("SUCCESS");

const exitButton = new MessageButton()
   .setCustomId("exit")
   .setLabel("Exit")
   .setStyle("DANGER");
