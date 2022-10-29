import {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   ButtonInteraction,
   CommandInteraction,
   GuildMember,
   Message,
   MessageButton,
   MessageEmbed,
   SelectMenuInteraction,
} from "discord.js";
import { SelectMenuOptions, SelectMenuRow } from "lib/discordComponents/selectMenu";
import { disableComponent, setComponent } from "lib/discordComponents/component";
import { findOrCreateAnime } from "cluster/anilist/libs/anime";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import { ButtonRow } from "lib/discordComponents/button";
import { catchNewError } from "lib/errors/errorHandling";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { getMediaIndex } from "lib/commands/media/mediaIndex/mediaIndex";
import { parseJson } from "lib/tools/text/parseJson";
import { textTruncate } from "lib/tools/text/textTruncate";
import {
   channelAddAnime,
   channelHasAnime,
   findOrCreateDiscordChannel,
} from "cluster/anilist/libs/discordChannel";
import { dmGuild } from "assets/reference";

import type Anime from "cluster/anilist/models/anime";
import DiscordGuild from "cluster/anilist/models/discordGuild";
import DiscordChannel from "cluster/anilist/models/discordChannel";
import { getSeasonalEmbedData } from "modules/listeners/client/interactions/commands/seasonal/seasonal.button";
import { airingAddSeasonalButtonRow } from "modules/listeners/client/interactions/commands/airing/airingAddSeasonal.button";
import { airingSeasonalButtonRow } from "modules/listeners/client/interactions/commands/airing/airingSeasonal.button";
import { getAiringAnimeData } from "lib/commands/airing/airingAnimeData";

@ApplyOptions<SlashCommandOptions>({
   info: {
      // description:
      //    "This command allows you to select a list of anime and view their episode scheduling in a selected channel",
      description:
         "Allows you to select a list of anime and view their episode scheduling in a selected channel",
      usage: [
         "this command has 4 sub-commands:",
         " • **anime-add** ↬ Adds an anime airing notification in the command executed channel",
         " • **anime-remove** ↬ Allows to remove one or more of the entries added with the previous command",
         " • **notification-role-set** ↬ Adds to the airing notification messages of the channel a role that will be taggedF",
         " • **notification-role-remove** ↬ Removes the role added with the previous command",
         " • **add-seasonal** ↬ shows the seasonal anime and helps adding them fast to airing",
      ],
   },
   arguments: [
      {
         name: "anime-add",
         description: "Adds an airing notification of the selected anime to the channel",
         type: "SUB_COMMAND",
         options: [
            {
               name: "media-title",
               description: "the anime to add to the airing notification channel",
               type: "STRING",
               autocomplete: true,
               required: true,
            },
         ],
      },
      {
         name: "anime-remove",
         description: "Select the anime to remove from the channel airing list",
         type: "SUB_COMMAND",
      },
      {
         name: "anime-list",
         description:
            "View the list of anime added to the airing notification of all the channels of the server",
         type: "SUB_COMMAND",
      },
      {
         name: "notification-role-set",
         description: "Adds to the channel airing messages a role that will be tagged",
         type: "SUB_COMMAND",
         options: [
            {
               name: "role",
               description: "the role to tag when a notification get's aired",
               type: "ROLE",
               required: true,
            },
         ],
      },
      {
         name: "notification-role-remove",
         description: "Removes the (setted) airing channel from displaying notifications",
         type: "SUB_COMMAND",
      },
      {
         name: "add-seasonal",
         description:
            "Add to the airing channel notification for selected seasonal anime",
         type: "SUB_COMMAND",
      },
   ],
})
export default class Airing extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      switch (interaction.options.getSubcommand()) {
         case "anime-list": {
            return Airing.subCommandAnimeList(interaction);
         }
         case "anime-add": {
            if (!(interaction.member as GuildMember).permissions.has("MANAGE_CHANNELS")) {
               return interaction.reply({
                  content:
                     'You need the permission "MANAGE_CHANNELS" to use this subcommand',
                  ephemeral: true,
               });
            }

            return this.subCommandAnimeAdd(interaction);
         }
         case "anime-remove": {
            if (!(interaction.member as GuildMember).permissions.has("MANAGE_CHANNELS")) {
               return interaction.reply({
                  content:
                     'You need the permission "MANAGE_CHANNELS" to use this subcommand',
                  ephemeral: true,
               });
            }

            return this.subCommandAnimeRemove(interaction);
         }
         case "notification-role-set": {
            if (!(interaction.member as GuildMember).permissions.has("MANAGE_CHANNELS")) {
               return interaction.reply({
                  content:
                     'You need the permission "MANAGE_CHANNELS" to use this subcommand',
                  ephemeral: true,
               });
            }

            return this.setNotification(interaction);
         }
         case "notification-role-remove": {
            if (!(interaction.member as GuildMember).permissions.has("MANAGE_CHANNELS")) {
               return interaction.reply({
                  content:
                     'You need the permission "MANAGE_CHANNELS" to use this subcommand',
                  ephemeral: true,
               });
            }

            return this.removeNotification(interaction);
         }
         case "add-seasonal": {
            if (!(interaction.member as GuildMember).permissions.has("MANAGE_CHANNELS")) {
               return interaction.reply({
                  content:
                     'You need the permission "MANAGE_CHANNELS" to use this subcommand',
                  ephemeral: true,
               });
            }

            return this.addSeasonal(interaction);
         }
      }
   }

   public static async subCommandAnimeList(
      interaction: CommandInteraction | ButtonInteraction,
   ) {
      //#region [args]

      const channel = interaction.channel;

      //#endregion

      if (!channel) {
         return interaction.reply({
            content: "This command can be run only in a guild/server channel or in DM",
            ephemeral: true,
         });
      }

      //#region [args]

      const guildId = channel.type === "DM" ? "0" : channel.guildId;

      //#endregion

      const guildChannels = await DiscordChannel.findAll({
         include: [
            {
               model: DiscordGuild,
               as: "discordGuild",
               where: {
                  id: guildId,
               },
            },
         ],
      });

      const airingList: string[] = [];

      for (const eachChannel of guildChannels) {
         const eachChannelAnimeList = await eachChannel.$get("anime");

         if (eachChannelAnimeList.length <= 0 && !eachChannel.channelNotificationRoleId)
            continue;

         eachChannelAnimeList.sort((a, b) => a.airingTime - b.airingTime);

         const animeList = eachChannelAnimeList
            .map(
               (mappedAnime) =>
                  `• **${textTruncate(mappedAnime.animeTitle, 30)}** ↬ ep ${
                     mappedAnime.airingEpisode
                  } releasing <t:${mappedAnime.airingTime}:R>`,
            )
            .join("\n");

         airingList.push(
            [
               `> **<#${eachChannel.id}> (notification role: <@&${eachChannel.channelNotificationRoleId}>):**`,
               "",
               !animeList ? "N/A" : animeList,
               "",
            ].join("\n"),
         );
      }

      const embed = new MessageEmbed()
         .setDescription(airingList.join("\n"))
         .setTitle("Airing notification list");

      interaction.reply({
         embeds: [embed],
         ephemeral: true,
      });
   }

   private async subCommandAnimeAdd(interaction: CommandInteraction) {
      //#region [args]

      const channel = interaction.channel;

      //#endregion

      if (!channel) {
         return interaction.reply({
            content: "This command can be run only in a guild/server channel or in DM",
            ephemeral: true,
         });
      }

      const discordChannel =
         channel.type === "DM"
            ? await findOrCreateDiscordChannel(channel.id, "DM", await dmGuild)
            : await findOrCreateDiscordChannel(
                 channel.id,
                 channel.name,
                 await findOrCreateDiscordGuild(channel.guild),
              );

      const responseObj = parseJson<AnimeTitleValue>(
         interaction.options.getString("media-title")!,
      );

      if (responseObj) {
         //#region [args]

         // const authorId = interaction.user.id;
         const idAl = responseObj[0];
         // const idMal = responseObj[1];
         // const isAdult = responseObj[2];

         //#endregion

         await addAiringAnime(interaction, idAl, discordChannel);
      } else {
         return interaction.reply({
            content:
               "when choosing the anime title select an element from the autocomplete list and then run the command",
            ephemeral: true,
         });
      }
   }

   private async subCommandAnimeRemove(interaction: CommandInteraction) {
      //#region [args]

      const channel = interaction.channel;
      const authorId = interaction.user.id;

      //#endregion

      if (!channel) {
         return interaction.reply({
            content: "This command can be run only in a guild/server channel or in DM",
            ephemeral: true,
         });
      }

      //#region [args]

      const guildId = channel.type === "DM" ? "0" : channel.guildId;

      //#endregion

      const guildChannels = await DiscordChannel.findAll({
         include: [
            {
               model: DiscordGuild,
               as: "discordGuild",
               where: {
                  id: guildId,
               },
            },
         ],
      });

      const anime: { anime: Anime; channel: DiscordChannel }[] = [];

      for (const eachChannel of guildChannels) {
         const eachChannelAnimeList = await eachChannel.$get("anime");

         if (eachChannelAnimeList.length <= 0) continue;

         eachChannelAnimeList.forEach((eachAnime) => {
            anime.push({
               anime: eachAnime,
               channel: eachChannel,
            });
         });
      }

      if (anime.length <= 0) {
         return interaction.reply({
            content:
               "There isn't any anime set up for the airing notification, add some using the command `/airing anime-add`",
            ephemeral: true,
         });
      }

      let selectedElements: {
         label: string;
         value: string;
      }[] = [];

      const selectedElementList = () => selectedElements.map((each) => `- ${each.label}`);

      const referenceEmbed = (status?: string) => {
         const description = [
            "Select the anime you want to remove from the airing channel by using the select menu",
            "The selected elements will be visualized under",
            "",
            "> **Selected elements:**",
            selectedElementList().length > 0
               ? selectedElementList().join("\n")
               : "Nothing selected",
         ];

         if (status) description.push(...["", status]);

         return new MessageEmbed()
            .setTitle("Anime-remove")
            .setDescription(description.join("\n"));
      };

      const options = anime.map((media, index) => {
         return {
            label: `${textTruncate(media.anime.animeTitle, 50)} 〈#${
               media.channel.name
            }〉`,
            value: `${index}`,
         };
      }) as SelectMenuOptions["options"];

      const statusSelectMenu: SelectMenuOptions = {
         customId: "status",
         placeHolder: "Select anime to remove",
         singlePick: false,
         options,
      };

      const sourceRow = new SelectMenuRow(statusSelectMenu);
      const pageRow = new ButtonRow([confirmButton, cancelButton]);

      const sent = (await interaction.reply({
         embeds: [referenceEmbed()],
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
               const selectedValues = (collectInteraction as SelectMenuInteraction)
                  .values;

               const newSelectedElements: {
                  label: string;
                  value: string;
               }[] = [];

               for (const eachValue of selectedValues) {
                  const found = options.find((option) => option.value === eachValue)!;

                  newSelectedElements.push(found);
               }

               selectedElements = newSelectedElements;

               return collectInteraction.update({
                  embeds: [referenceEmbed()],
               });
            }
            case "BUTTON": {
               switch (collectInteraction.customId) {
                  case "confirm": {
                     if (selectedElements.length <= 0) {
                        return collectInteraction.reply({
                           content: [
                              "there isn't any selected option, select an option or cancel the operation",
                           ].join("\n"),
                           ephemeral: true,
                        });
                     }

                     for (const each of selectedElements) {
                        const animeIndex = Number(each.value);

                        const selectedAnime = anime[animeIndex];

                        await selectedAnime.channel.$remove("anime", selectedAnime.anime);
                     }

                     const embed = new MessageEmbed().setDescription(
                        [
                           "> **Removed these anime from the channel airing notification:**",
                           selectedElementList().join("\n"),
                        ].join("\n"),
                     );

                     return collectInteraction.update({
                        embeds: [embed],
                        components: [],
                     });
                  }
                  case "cancel": {
                     return collectInteraction.update({
                        embeds: [
                           referenceEmbed(
                              [
                                 `> **[Status:](${sent.url})**`,
                                 "operation cancelled successfully",
                              ].join("\n"),
                           ),
                        ],
                        components: [],
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

   private async setNotification(interaction: CommandInteraction) {
      //#region [args]

      const channel = interaction.channel;

      //#endregion

      if (!channel) {
         return interaction.reply({
            content: "This command can be run only in a guild/server channel or in DM",
            ephemeral: true,
         });
      }

      const discordChannel =
         channel.type === "DM"
            ? await findOrCreateDiscordChannel(channel.id, "DM", await dmGuild)
            : await findOrCreateDiscordChannel(
                 channel.id,
                 channel.name,
                 await findOrCreateDiscordGuild(channel.guild),
              );

      const role = interaction.options.getRole("role", true);

      if (discordChannel.channelNotificationRoleId) {
         const oldRole = discordChannel.channelNotificationRoleId;

         await discordChannel.update({
            channelNotificationRoleId: role.id,
         });

         return interaction.reply({
            content: [
               `Replaced the airing notification role **of this channel** from <@&${oldRole}> to <@&${role.id}>`,
            ].join("\n"),
         });
      } else {
         await discordChannel.update({
            channelNotificationRoleId: role.id,
         });

         return interaction.reply({
            content: [
               `Set the airing notification role **of this channel** to <@&${role.id}>`,
            ].join("\n"),
         });
      }
   }

   private async removeNotification(interaction: CommandInteraction) {
      //#region [args]

      const channel = interaction.channel;

      //#endregion

      if (!channel) {
         return interaction.reply({
            content: "This command can be run only in a guild/server channel or in DM",
            ephemeral: true,
         });
      }

      const discordChannel =
         channel.type === "DM"
            ? await findOrCreateDiscordChannel(channel.id, "DM", await dmGuild)
            : await findOrCreateDiscordChannel(
                 channel.id,
                 channel.name,
                 await findOrCreateDiscordGuild(channel.guild),
              );

      if (!discordChannel.channelNotificationRoleId) {
         return interaction.reply({
            content: [
               "An airing notification role for this channel hasn't been set up, use the command `/airing notification-role-set` to do so",
            ].join("\n"),
            ephemeral: true,
         });
      } else {
         const role = discordChannel.channelNotificationRoleId;

         await discordChannel.update({
            channelNotificationRoleId: null,
         });

         return interaction.reply({
            content: [
               `Successfully removed the role <@&${role}> **from this channel's** notification system`,
            ].join("\n"),
         });
      }
   }

   private async addSeasonal(interaction: CommandInteraction) {
      //#region [args]

      const authorId = interaction.user.id;

      //#endregion

      const seasonalData = await getSeasonalEmbedData(1);

      const buttonRow = airingSeasonalButtonRow(1, authorId, seasonalData.hasNext);

      const animeList = seasonalData.animeList;

      const animeButtonList = animeList.map((element) =>
         airingAddSeasonalButtonRow(authorId, element[0], element[1]),
      );

      interaction.reply({
         embeds: seasonalData.embeds,
         components: setComponent(buttonRow, ...animeButtonList),
         ephemeral: true,
      });
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         switch (interaction.options.getSubcommand()) {
            case "anime-add": {
               return this.autocompleteAnimeAdd(interaction);
            }
         }
      } catch (error: any) {
         this.catchAutocompleteError(error);
      }
   }

   private async autocompleteAnimeAdd(interaction: AutocompleteInteraction) {
      const title = interaction.options.getFocused(true).value as string;

      const titleSplit = title.toLowerCase().split(" ").pop();

      const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

      const openParenthesis = "〈";
      const closedParenthesis = "〉";

      switch (titleSplit) {
         case "ona": {
            const mediaIndex = await getMediaIndex(title, 1, "ANIME", "ONA");

            if (mediaIndex) {
               mediaIndex.forEach((value) => {
                  const appValue: AnimeTitleValue = [
                     value.idAl,
                     value.idMal,
                     value.isAdult,
                  ];

                  applicationChoice.push({
                     name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                        value.format
                     }${closedParenthesis}`,
                     value: JSON.stringify(appValue),
                  });
               });
            }

            return interaction.respond(applicationChoice);
         }
         case "ova": {
            const mediaIndex = await getMediaIndex(title, 1, "ANIME", "OVA");

            if (mediaIndex) {
               mediaIndex.forEach((value) => {
                  const appValue: AnimeTitleValue = [
                     value.idAl,
                     value.idMal,
                     value.isAdult,
                  ];

                  applicationChoice.push({
                     name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                        value.format
                     }${closedParenthesis}`,
                     value: JSON.stringify(appValue),
                  });
               });
            }

            return interaction.respond(applicationChoice);
         }
         case "special": {
            const mediaIndex = await getMediaIndex(title, 1, "ANIME", "SPECIAL");

            if (mediaIndex) {
               mediaIndex.forEach((value) => {
                  const appValue: AnimeTitleValue = [
                     value.idAl,
                     value.idMal,
                     value.isAdult,
                  ];

                  applicationChoice.push({
                     name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                        value.format
                     }${closedParenthesis}`,
                     value: JSON.stringify(appValue),
                  });
               });
            }

            return interaction.respond(applicationChoice);
         }
      }

      const mediaIndexGeneric = await getMediaIndex(title, 8, "ANIME");

      if (mediaIndexGeneric) {
         mediaIndexGeneric.forEach((value) => {
            const appValue: AnimeTitleValue = [value.idAl, value.idMal, value.isAdult];

            applicationChoice.push({
               name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                  value.format
               }${closedParenthesis}`,
               value: JSON.stringify(appValue),
            });
         });
      }

      return interaction.respond(applicationChoice);
   }
}

type AnimeTitleValue = [idAl: number, idMal: number, isAdult: boolean];

const confirmButton = new MessageButton()
   .setCustomId("confirm")
   .setLabel("Confirm and remove")
   //.setEmoji(arrowRight.id)
   .setStyle("SUCCESS");

const cancelButton = new MessageButton()
   .setCustomId("cancel")
   .setLabel("Cancel")
   //.setEmoji(arrowLeft.id)
   .setStyle("DANGER");

export async function addAiringAnime(
   interaction: CommandInteraction | ButtonInteraction,
   idAl: number,
   discordChannel: DiscordChannel,
) {
   const animeData = await getAiringAnimeData(idAl);

   if (!animeData.nextAiringEpisode) {
      const reason =
         animeData.status === "FINISHED"
            ? "The anime has already ended, no more episodes will air for this entry"
            : animeData.status === "NOT_YET_RELEASED"
            ? "The anime hasn't yet released it's schedule to the web, try again later!"
            : "This media doesn't have a scheduled `airing episode` so it cannot be added to che airing list";

      const embed = new MessageEmbed()
         .setThumbnail(animeData.coverImage.large || "N/A")
         .setColor("RED")
         .setDescription(
            [
               `**Media title** ↬ **[${animeData.title}](${animeData.siteUrl})**`,
               `**Status** ↬ \`${animeData.status || "N/A"}\``,
               `**Next airing episode** ↬ \`N/A\``,
               "",
               "> **Not a valid media**",
               reason,
            ].join("\n"),
         );

      return interaction.reply({
         embeds: [embed],
         ephemeral: true,
      });
   }

   const anime = await findOrCreateAnime({
      ...animeData,
      nextAiringEpisode: animeData.nextAiringEpisode,
   });

   if (await channelHasAnime(discordChannel, anime)) {
      return interaction.reply({
         content: [
            "The chosen anime is already present in the notification list of this channel",
         ].join("\n"),
         ephemeral: true,
      });
   }

   await channelAddAnime(discordChannel, anime);

   const embed = new MessageEmbed()
      .setColor(animeData.coverImage.color || "DEFAULT")
      .setURL(animeData.siteUrl || "")
      .setThumbnail(animeData.coverImage.large || "N/A")
      .setDescription(
         [
            `> **Added [${animeData.title}](${animeData.siteUrl}) to the airing schedule**`,
            "",
            `**Episode releasing** ↬ <t:${anime.airingTime}:R>`,
            `**Episode N°** ↬ \`${anime.airingEpisode}\``,
         ].join("\n"),
      );

   interaction.reply({
      embeds: [embed],
   });
}
