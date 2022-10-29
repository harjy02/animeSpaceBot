import {
   ButtonInteraction,
   ColorResolvable,
   Message,
   MessageActionRow,
   MessageButton,
   MessageEmbed,
   Modal,
   ModalActionRowComponent,
   TextInputComponent,
} from "discord.js";
import { ButtonRow } from "lib/discordComponents/button";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { getAuthData } from "cluster/anilist/libs/authData";
import { unAuthenticated } from "lib/templates/unAuthenticated";
import { airingUpdateEpisodeStatus } from "lib/commands/airing/airingUpdateEpisodeStatus";
import { FuzzyDateInput, Status } from "typings/anilist/media";
import { setComponent } from "lib/discordComponents/component";
import { airingGetEpisodeData } from "lib/commands/airing/airingGetEpisodeData";
import moment from "moment";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: ButtonTuple) {
      try {
         const obj = extractButtonId(arr);

         //#region [args]

         const idAl = obj.idAl;
         const authorId = interaction.user.id;
         const progress = obj.progress;
         const status = obj.status;
         const guild =
            interaction.channel?.type === "DM"
               ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
               : interaction.guild;

         //#endregion

         if (!guild)
            return interaction.reply("interaction only usable in a guild or in DM");

         const authData = await getAuthData(guild.id, authorId);
         if (!authData) return unAuthenticated(interaction, { ephemeral: true });

         const airingMediaData = await airingGetEpisodeData(authData, idAl);
         const mediaData = airingMediaData.data.Media;
         const mediaListEntry = mediaData.mediaListEntry;
         const userData = airingMediaData.data.Viewer;

         const unChangedData: Map<string, string> = new Map();
         const changedData: Map<string, string> = new Map();

         let score: number | undefined;
         let startedAt: FuzzyDateInput | undefined;
         let completedAt: FuzzyDateInput | undefined;

         if (mediaListEntry && mediaListEntry.score)
            unChangedData.set("score", `**Score** ↬ \`${mediaListEntry.score}\``);
         else unChangedData.set("score", `**Score** ↬ \`N/A\``);

         if (
            mediaListEntry &&
            mediaListEntry.status &&
            mediaListEntry.status === status
         ) {
            unChangedData.set("status", `**Status** ↬ \`${status}\``);
         } else {
            changedData.set(
               "status",
               `**Status**: \`${mediaListEntry?.status || "N/A"} -> ${status}\``,
            );
         }

         if (
            mediaListEntry &&
            mediaListEntry.progress &&
            mediaListEntry.progress === progress
         ) {
            unChangedData.set("progress", `**Progress** ↬ \`${progress}\``);
         } else {
            changedData.set(
               "progress",
               `**Progress**: \`${mediaListEntry?.progress || "N/A"} -> ${progress}\``,
            );
         }

         if (
            mediaListEntry &&
            mediaListEntry.startedAt &&
            (mediaListEntry.startedAt.day ||
               mediaListEntry.startedAt.month ||
               mediaListEntry.startedAt.year)
         ) {
            unChangedData.set(
               "startedAt",
               `**Started At** ↬ \`${mediaListEntry.startedAt.day}/${mediaListEntry.startedAt.month}/${mediaListEntry.startedAt.year}\``,
            );
         } else {
            const momentNow = moment();

            startedAt = {
               day: Number(momentNow.format("D")),
               month: Number(momentNow.format("M")),
               year: Number(momentNow.format("Y")),
            };

            changedData.set(
               "startedAt",
               `**Started At**: \`N/A -> ${startedAt.day}/${startedAt.month}/${startedAt.year}\``,
            );
         }

         if (
            mediaListEntry &&
            mediaListEntry.completedAt &&
            status === "COMPLETED" &&
            !mediaListEntry.completedAt.day &&
            !mediaListEntry.completedAt.month &&
            !mediaListEntry.completedAt.year
         ) {
            const momentNow = moment();

            completedAt = {
               day: Number(momentNow.format("D")),
               month: Number(momentNow.format("M")),
               year: Number(momentNow.format("Y")),
            };

            changedData.set(
               "completedAt",
               `**Completed At**: \`N/A -> ${completedAt.day}/${completedAt.month}/${completedAt.year}\``,
            );
         }

         const embed = () =>
            new MessageEmbed()
               .setAuthor({
                  name: userData.name,
                  url: userData.siteUrl,
                  iconURL: userData.avatar.large,
               })
               .setThumbnail(mediaData.coverImage.large)
               .setColor((mediaData.coverImage.color as ColorResolvable) || "DEFAULT")
               .setDescription(
                  [
                     `> **[${
                        mediaData.title.english || mediaData.title.romaji || "N/A"
                     }](${mediaData.siteUrl})**`,
                     unChangedData.size > 0
                        ? "\n" + Array.from(unChangedData.values()).join("\n") + "\n"
                        : "",
                     changedData.size > 0
                        ? [
                             `**[Update your anime progress with the following data?](${
                                (interaction.message as Message).url
                             })**`,
                             "",
                             Array.from(changedData.values()).join("\n"),
                          ].join("\n")
                        : "Your anime progress is already up-to-date!",
                  ].join("\n"),
               );

         const scoreButton = new MessageButton()
            .setCustomId("score")
            .setLabel(mediaListEntry.score ? "Edit score" : "Add score")
            .setStyle("PRIMARY");

         const buttonRow = new ButtonRow([confirmButton, exitButton, scoreButton]);

         const sent = (await interaction.reply({
            embeds: [embed()],
            components:
               changedData.size > 0
                  ? setComponent(buttonRow)
                  : setComponent(buttonRow.disableButton([0])),
            fetchReply: true,
            ephemeral: true,
         })) as Message;

         const collector = sent.createMessageComponentCollector();

         collector.on("collect", async (collectInteraction) => {
            if (collectInteraction.user.id !== authorId) {
               return collectInteraction.reply({
                  content: "This interaction is not for you..",
                  ephemeral: true,
               });
            }

            switch (collectInteraction.customId) {
               case "score": {
                  const scoreInput = new TextInputComponent()
                     .setCustomId("score")
                     // The label is the prompt the user sees for this input
                     .setLabel("The score")
                     // Short means only a single line of text
                     .setStyle("SHORT");

                  const firstActionRow =
                     new MessageActionRow<ModalActionRowComponent>().addComponents(
                        scoreInput,
                     );

                  const modal = new Modal()
                     .setCustomId("airingScore")
                     .setTitle("Score")
                     .addComponents(firstActionRow);

                  await collectInteraction.showModal(modal);
                  const result = await collectInteraction
                     .awaitModalSubmit({
                        time: 100000,
                     })
                     .catch((error: Error) => {
                        if (error.message.includes("reason: time")) return;
                        throw error;
                     });

                  if (!result) return;

                  score = Number(result.components[0].components[0].value);

                  unChangedData.delete("score");
                  changedData.set(
                     "score",
                     `**Score**: \`${mediaListEntry?.score || "N/A"} -> ${score}\``,
                  );

                  return result.update({
                     embeds: [embed()],
                     components: setComponent(buttonRow.enableButton([0, 1, 2])),
                  });
               }
               case "confirm": {
                  const updateResults = (
                     await airingUpdateEpisodeStatus(
                        authData,
                        idAl,
                        progress,
                        status,
                        score,
                        startedAt,
                        completedAt,
                     )
                  ).data.SaveMediaListEntry;

                  const confirmEmbed = new MessageEmbed()
                     .setAuthor({
                        name: updateResults.user.name,
                        url: updateResults.user.siteUrl,
                        iconURL: updateResults.user.avatar.large,
                     })
                     .setThumbnail(updateResults.media.coverImage.large)
                     .setColor(
                        (updateResults.media.coverImage.color as ColorResolvable) ||
                           "DEFAULT",
                     )
                     .setDescription(
                        [
                           `> **[${
                              mediaData.title.english || mediaData.title.romaji || "N/A"
                           }](${mediaData.siteUrl})**`,
                           unChangedData.size > 0
                              ? "\n" +
                                Array.from(unChangedData.values()).join("\n") +
                                "\n"
                              : "",
                           changedData.size > 0
                              ? [
                                   `**[Successfully updated data:](${
                                      (interaction.message as Message).url
                                   })**`,
                                   "",
                                   Array.from(changedData.values()).join("\n"),
                                ].join("\n")
                              : "Your anime progress is already up-to-date!",
                        ].join("\n"),
                     );

                  return collectInteraction.update({
                     embeds: [confirmEmbed],
                     components: [],
                  });
               }
               case "exit": {
                  collectInteraction.update({
                     embeds: [new MessageEmbed().setDescription(`Update cancelled`)],
                     components: [],
                  });
                  return;
               }
            }
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function airingWatchedButton(idAl: number, progress: number, status: Status) {
   const customIdValues: ButtonTuple = [
      "airing.episodeStatus.button",
      idAl,
      progress,
      status,
   ];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel(`Add episode to watched`)
      .setStyle("SUCCESS");

   return button;
}

interface ButtonData {
   idAl: number;
   progress: number;
   status: Status;
}
interface ButtonInterface {
   customId: string;
   idAl: number;
   progress: number;
   status: Status;
}
type ButtonTuple = [customId: string, idAl: number, progress: number, status: Status];

function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
      idAl: arr[1],
      progress: arr[2],
      status: arr[3],
   };

   return obj;
}

const confirmButton = new MessageButton()
   .setCustomId("confirm")
   .setLabel("Update")
   .setStyle("SUCCESS");

const exitButton = new MessageButton()
   .setCustomId("exit")
   .setLabel("Exit")
   .setStyle("DANGER");
