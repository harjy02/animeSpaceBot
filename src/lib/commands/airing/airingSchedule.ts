import { ColorResolvable, MessageEmbed, TextChannel } from "discord.js";
import fetch, { RequestInit } from "node-fetch";

import type Anime from "cluster/anilist/models/anime";
import { catchNewError } from "lib/errors/errorHandling";
import { container } from "@sapphire/pieces";
import { scheduleJob } from "node-schedule";
import type DiscordChannel from "cluster/anilist/models/discordChannel";
import { setComponent } from "lib/discordComponents/component";
import { ButtonRow } from "lib/discordComponents/button";
import { airingListButton } from "modules/listeners/client/interactions/commands/airing/airingList.button";
import { airingWatchedButton } from "modules/listeners/client/interactions/commands/airing/airing.episodeStatus.button";

export async function setAiringSchedule(anime: Anime) {
   const airingDate = new Date(anime.airingTime * 1000);

   scheduleJob(airingDate, async () => {
      const channels = await anime.$get("discordChannel");

      if (channels.length <= 0) anime.destroy();

      const animeData = await getAiringData(anime.idAl, [
         anime.airingEpisode,
         anime.airingEpisode + 1,
      ]);

      const externalLinks: string[] = [];
      if (animeData.externalLinks) {
         for (const link of animeData.externalLinks) {
            externalLinks.push(
               `[${link?.site || "N/A"}](${link?.url || "https://example.com/"})`,
            );
         }
      }

      if (animeData.status && animeData.status === "CANCELLED") {
         const embed = new MessageEmbed()
            .setTitle(animeData.title)
            .setURL(animeData.siteUrl)
            .setThumbnail(animeData.thumbnail)
            .setColor(animeData.color)
            .setDescription(
               [
                  "The media status has been changed to `cancelled`, the notification for this media will be removed",
               ].join("\n"),
            );

         const buttonRow = new ButtonRow([airingListButton()]);
         await send(channels, embed, buttonRow);

         return anime.destroy();
      }

      const releasingEp = animeData.airingSchedules.find(
         (value) => value.episode === anime.airingEpisode,
      )!;
      const airingCheckedDate = new Date(releasingEp.airingAt * 1000);

      const nextAiring = animeData.nextAiringEpisode;

      //episode moved to another date
      if (airingCheckedDate.getTime() !== airingDate.getTime()) {
         // is there a episode that will release with the current saved date?
         const currentAiringEpisode = animeData.airingSchedules.find(
            (value) => value.airingAt === airingDate.getTime(),
         );
         if (currentAiringEpisode) {
            if (nextAiring) {
               anime.update({
                  airingTime: nextAiring.airingAt,
                  airingEpisode: nextAiring.episode,
               });

               await setAiringSchedule(anime);
            } else {
               anime.destroy();
            }

            const embed = new MessageEmbed()
               .setURL(animeData.siteUrl)
               .setThumbnail(animeData.thumbnail)
               .setColor(animeData.color)
               .setFooter({
                  text: "It might take some time for the episode to appear on streaming sites",
               })
               .setDescription(
                  [
                     `> **[${animeData.title}](${animeData.siteUrl}) has just aired!**`,
                     "",
                     `**Released episode** ↬ \`${currentAiringEpisode.episode} ${
                        animeData.episodes ? `(of ${animeData.episodes})` : ""
                     }\``,
                     nextAiring
                        ? `**Next episode releasing** ↬ <t:${nextAiring.airingAt}:R>`
                        : "**There is now ETA for the next airing episode, this anime will be removed from the airing schedule, try adding it again later**",
                     `**Current score** ↬ \`${animeData.averageScore}\``,
                     `**External links** ↬ ${
                        externalLinks.slice(0, 5).join(" • ") || "`N/A`"
                     }`,
                  ].join("\n"),
               );

            const buttonRow = new ButtonRow([airingListButton()]);
            await send(channels, embed, buttonRow);
            return;
         }

         if (airingCheckedDate.getTime() > airingDate.getTime()) {
            anime.update({
               airingTime: releasingEp.airingAt,
               airingEpisode: anime.airingEpisode,
            });

            await setAiringSchedule(anime);

            const embed = new MessageEmbed()
               .setURL(animeData.siteUrl)
               .setThumbnail(animeData.thumbnail)
               .setColor(animeData.color)
               .setFooter({
                  text: "It might take some time for the episode to appear on streaming sites",
               })
               .setDescription(
                  [
                     `> **[${animeData.title}](${animeData.siteUrl}) release update**`,
                     "",
                     `The releasing of the episode \`${
                        anime.airingEpisode
                     }\` has been rescheduled from <t:${
                        airingDate.getTime() / 1000
                     }:f> to <t:${airingCheckedDate.getTime() / 1000}:f>`,
                     `The episode \`${anime.airingEpisode}\` will release in <t:${releasingEp.airingAt}:R>`,
                  ].join("\n"),
               );

            const buttonRow = new ButtonRow([airingListButton()]);
            await send(channels, embed, buttonRow);
            return;
         } else {
            // the episode that was schedules for "today" was already released so there is no point in sending a notification now
            // check if there is any episode that will release for next
            // if there is -> schedule it, if there isn't -> destroy the anime schedule
            if (nextAiring) {
               anime.update({
                  airingTime: nextAiring.airingAt,
                  airingEpisode: nextAiring.episode,
               });
               setAiringSchedule(anime);
            } else {
               anime.destroy();
            }
            return;
         }
      }

      //has the next airing episode
      if (
         animeData.airingSchedules.some(
            (value) => value.episode === anime.airingEpisode + 1,
         )
      ) {
         const releasingEpisode = anime.airingEpisode;

         const nextReleasingData = animeData.airingSchedules.find(
            (value) => value.episode === releasingEpisode + 1,
         )!;

         anime.update({
            airingTime: nextReleasingData.airingAt,
            airingEpisode: nextReleasingData.episode,
         });

         await setAiringSchedule(anime);

         const embed = new MessageEmbed()
            .setURL(animeData.siteUrl)
            .setThumbnail(animeData.thumbnail)
            .setColor(animeData.color)
            .setFooter({
               text: "It might take some time for the episode to appear on streaming sites",
            })
            .setDescription(
               [
                  `> **[${animeData.title}](${animeData.siteUrl}) has just aired!**`,
                  "",
                  `**Released episode** ↬ \`${releasingEpisode} ${
                     animeData.episodes ? `(of ${animeData.episodes})` : ""
                  }\``,
                  `**Next episode releasing** ↬ <t:${nextReleasingData.airingAt}:R>`,
                  `**Current score** ↬ \`${animeData.averageScore}\``,
                  `**External links** ↬ ${
                     externalLinks.slice(0, 5).join(" • ") || "`N/A`"
                  }`,
               ].join("\n"),
            );

         const buttonRow = new ButtonRow([
            airingWatchedButton(anime.idAl, releasingEpisode, "CURRENT"),
            airingListButton(),
         ]);
         await send(channels, embed, buttonRow);

         //last episode
      } else if (animeData.episodes && animeData.episodes === anime.airingEpisode) {
         const embed = new MessageEmbed()
            .setURL(animeData.siteUrl)
            .setThumbnail(animeData.thumbnail)
            .setColor(animeData.color)
            .setFooter({
               text: "It might take some time for the episode to appear on streaming sites",
            })
            .setDescription(
               [
                  `> **[${animeData.title}](${animeData.siteUrl}) has just aired!**`,
                  "",
                  `**Released episode** ↬ \`${anime.airingEpisode} ${
                     animeData.episodes ? `(of ${animeData.episodes})` : ""
                  }\``,
                  "**Anime status** ↬ `Completed!`",
                  `**Current score** ↬ \`${animeData.averageScore}\``,
                  `**External links** ↬ ${
                     externalLinks.slice(0, 5).join(" • ") || "`N/A`"
                  }`,
               ].join("\n"),
            );

         const buttonRow = new ButtonRow([
            airingWatchedButton(anime.idAl, animeData.episodes, "COMPLETED"),
            airingListButton(),
         ]);
         await send(channels, embed, buttonRow);

         anime.destroy();
      } else {
         throw catchNewError("unrecognized condition in airingSchedule", animeData);
      }
   });
}

async function send(
   channels: DiscordChannel[],
   embed: MessageEmbed,
   buttonRow?: ButtonRow,
) {
   for (const eachChannel of channels) {
      const channelId = eachChannel.id;

      const channel = (await container.client.channels.fetch(channelId)) as TextChannel;

      const content = eachChannel.channelNotificationRoleId
         ? `RoleTag: <@&${eachChannel.channelNotificationRoleId}>`
         : null;

      // const buttonRow = airingWatchedButtonRow(21, 1037, "CURRENT");

      await channel.send({
         content,
         embeds: [embed],
         components: buttonRow ? setComponent(buttonRow) : undefined,
      });
   }
}

async function getAiringData(idAl: number, episode: number[]) {
   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: AiringDataQuery,
         variables: { mediaId: idAl, episodeIn: episode },
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as AiringDataInterface;
         }
      })
      .catch((error) => {
         throw error;
      });

   const airingReturnData: AiringReturnData = {
      airingSchedules: fetchData.data.Page.airingSchedules,
      title: fetchData.data.Media.title.english || "N/A",
      thumbnail: fetchData.data.Media.coverImage.large || "N/A",
      color: fetchData.data.Media.coverImage.color || "DEFAULT",
      siteUrl: fetchData.data.Media.siteUrl || "N/A",
      episodes: fetchData.data.Media.episodes,
      status: fetchData.data.Media.status,
      averageScore: fetchData.data.Media.averageScore,
      externalLinks: fetchData.data.Media.externalLinks,
      nextAiringEpisode: fetchData.data.Media.nextAiringEpisode,
   };

   return airingReturnData;
}

interface AiringReturnData {
   airingSchedules: {
      airingAt: number;
      episode: number;
   }[];
   title: string;
   thumbnail: string;
   color: ColorResolvable;
   siteUrl: string;
   episodes: number | null;
   status: string | null;
   averageScore: number | null;
   nextAiringEpisode: {
      episode: number;
      airingAt: number;
   } | null;
   externalLinks:
      | {
           url: string;
           site: string;
        }[]
      | null;
}

interface AiringDataInterface {
   data: {
      Page: {
         airingSchedules: {
            airingAt: number;
            episode: number;
         }[];
      };
      Media: {
         title: {
            english: string | null;
         };
         coverImage: {
            large: string | null;
            color: ColorResolvable | null;
         };
         status: string | null;
         siteUrl: string | null;
         episodes: number | null;
         averageScore: number | null;
         nextAiringEpisode: {
            episode: number;
            airingAt: number;
         } | null;
         externalLinks:
            | {
                 url: string;
                 site: string;
              }[]
            | null;
      };
   };
}

const AiringDataQuery = /* GraphQL */ `
   query ($mediaId: Int, $episodeIn: [Int]) {
      Page(page: 1, perPage: 50) {
         airingSchedules(mediaId: $mediaId, episode_in: $episodeIn, sort: TIME) {
            airingAt
            episode
         }
      }
      Media(id: $mediaId) {
         title {
            english
         }
         coverImage {
            large
            color
         }
         status
         siteUrl
         episodes
         averageScore
         nextAiringEpisode {
            episode
            airingAt
         }
         externalLinks {
            url
            site
         }
      }
   }
`;
