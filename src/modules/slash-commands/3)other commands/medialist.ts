import {
   CommandInteraction,
   Message,
   MessageButton,
   MessageEmbed,
   SelectMenuInteraction,
} from "discord.js";
import { MediaList, Status } from "lib/commands/mediaList/mediaList";
import { SelectMenuOptions, SelectMenuRow } from "lib/discordComponents/selectMenu";
import { arrowLeft, arrowRight } from "assets/emoji";
import { disableComponent, setComponent } from "lib/discordComponents/component";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import { ButtonRow } from "lib/discordComponents/button";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { unConnected } from "lib/templates/unConnected";
import { getUserData } from "cluster/anilist/libs/userData";
import { catchNewError } from "lib/errors/errorHandling";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "This command allows you to view your lists (as the planning, completed, dropped etc..)",
      requirements:
         "This command requires to be connected to a :anilist: profile (by running `/connect`)",
      usage: `To use the command just run it without any argument and then use the buttons and menus to navigate through`,
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const authorId = interaction.user.id;
      const guild =
         interaction.channel?.type === "DM"
            ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
            : interaction.guild;

      //#endregion

      if (!guild) return interaction.reply("command only usable in a guild or in DM");

      const userData = await getUserData(guild.id, authorId);
      if (!userData) return unConnected(interaction, { ephemeral: true });

      let currentPage = 1;
      let currentStatus: Status = "Current";

      const mediaList = new MediaList(userData, 8);
      const startList = await mediaList.getList(currentStatus, currentPage);

      let hasNext = startList.hasNext;

      const userDataInfo = await mediaList.getUserInfo();

      const listEmbed = new MessageEmbed()
         .setColor("PURPLE")
         .setTitle(`${userDataInfo.name} anime list`)
         .setURL(userDataInfo.siteUrl)
         .setThumbnail(userDataInfo.avatar)
         .setDescription(startList.description)
         .setTimestamp();

      const sourceRow = new SelectMenuRow(statusSelectMenu);
      const pageRow = new ButtonRow([backPageButton, nextPageButton]);

      pageRow.hideButton([0]);
      if (!hasNext) pageRow.hideButton([1]);

      const sent = (await interaction.reply({
         embeds: [listEmbed],
         components: setComponent(sourceRow, pageRow),
         fetchReply: true,
      })) as Message;

      const collector = sent.createMessageComponentCollector({
         idle: 300000,
      });

      collector.on("collect", async (collectInteraction) => {
         if (collectInteraction.user.id !== authorId) {
            return collectInteraction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         switch (collectInteraction.componentType) {
            case "SELECT_MENU": {
               currentStatus = (collectInteraction as SelectMenuInteraction)
                  .values[0] as Status;
               currentPage = 1;

               const currentList = await mediaList.getList(currentStatus, currentPage);

               //__<variables>
               hasNext = currentList.hasNext;
               pageRow.hideButton([0]);
               if (!hasNext) pageRow.hideButton([1]);
               else pageRow.showButton([1]);
               //__</variables>

               return collectInteraction.update({
                  embeds: [listEmbed.setDescription(currentList.description)],
                  components: setComponent(
                     sourceRow.setPlaceHolder(`Current status: ${currentStatus}`),
                     pageRow,
                  ),
               });
            }
            case "BUTTON": {
               switch (collectInteraction.customId) {
                  case "nextPage": {
                     currentPage++;

                     const currentList = await mediaList.getList(
                        currentStatus,
                        currentPage,
                     );

                     //__<variables>
                     hasNext = currentList.hasNext;
                     if (currentPage > 1) pageRow.showButton([0]);
                     if (!hasNext) pageRow.hideButton([1]);
                     //__</variables>

                     return collectInteraction.update({
                        embeds: [listEmbed.setDescription(currentList.description)],
                        components: setComponent(
                           sourceRow.setPlaceHolder(`Current status: ${currentStatus}`),
                           pageRow,
                        ),
                     });
                  }
                  case "backPage": {
                     currentPage--;

                     const currentList = await mediaList.getList(
                        currentStatus,
                        currentPage,
                     );

                     //__<variables>
                     hasNext = currentList.hasNext;
                     if (currentPage === 1) pageRow.hideButton([0]);
                     if (hasNext) pageRow.showButton([1]);
                     //__</variables>

                     return collectInteraction.update({
                        embeds: [listEmbed.setDescription(currentList.description)],
                        components: setComponent(
                           sourceRow.setPlaceHolder(`Current status: ${currentStatus}`),
                           pageRow,
                        ),
                     });
                  }
               }
               break;
            }
         }
      });
      collector.on("end", (_listener, reason) => {
         switch (reason) {
            case "idle": {
               sent.edit({ components: disableComponent(sourceRow, pageRow) });
               break;
            }
            default: {
               throw catchNewError(reason);
            }
         }
      });
   }
}

const nextPageButton = new MessageButton()
   .setCustomId("nextPage")
   .setLabel("Next")
   .setEmoji(arrowRight.id)
   .setStyle("PRIMARY");

const backPageButton = new MessageButton()
   .setCustomId("backPage")
   .setLabel("Back")
   .setEmoji(arrowLeft.id)
   .setStyle("PRIMARY");

const statusSelectMenu: SelectMenuOptions = {
   customId: "status",
   placeHolder: "Current status: Current",
   singlePick: true,
   options: [
      {
         label: "Current",
         value: "Current",
      },
      {
         label: "Planning",
         value: "Planning",
      },
      {
         label: "Completed",
         value: "Completed",
      },
      {
         label: "Dropped",
         value: "Dropped",
      },
      {
         label: "Paused",
         value: "Paused",
      },
   ],
};
