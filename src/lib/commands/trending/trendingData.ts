import { ColorResolvable, MessageEmbed } from "discord.js";

import fetch from "node-fetch";
import { parseMs } from "lib/tools/other/parseMs";
import { textJoin } from "lib/tools/text/textJoin";

export interface TrendingMediaData {
   title: string;
   siteUrl: string;
   color: ColorResolvable;
   thumbnail: string;
   meanScore: string;
   externalLinks: string;
   trailer: string;
   nextAiringEpisode:
      | {
           timeUntilAiring: Date;
           episode: number;
        }
      | "concluded";
}
export interface TrendingData {
   media: TrendingMediaData[];
   hasNext: boolean;
}

export interface TrendingEmbedData {
   embeds: MessageEmbed[];
   hasNext: boolean;
}

export class Trending {
   private perPage: number;

   constructor(perPage: number) {
      this.perPage = perPage;
   }

   public async getTrendingData(page: number) {
      const perPage = this.perPage;

      const anilistOptions = {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
         },
         body: JSON.stringify({
            query,
            variables: { page, perPage },
         }),
      };

      const fetchData = await fetch("https://graphql.anilist.co", anilistOptions)
         .then(async (response) => {
            const result = await response.text();
            if (!response.ok) {
               throw new Error(result);
            } else {
               const json = await JSON.parse(result);
               return json as Query;
            }
         })
         .catch((error) => {
            throw error;
         });

      const media: TrendingMediaData[] = [];

      fetchData.data.Page.media.forEach((value) => {
         const externalLinks: string[] = [];
         value.externalLinks.forEach((value2) =>
            externalLinks.push(`[${value2.site}](${value2.url})`),
         );

         media.push({
            title: value.title.english || value.title.romaji,
            siteUrl: value.siteUrl,
            color: value.coverImage.color,
            thumbnail: value.coverImage.large,
            meanScore: value.meanScore ? `${value.meanScore}%` : "N/A",
            externalLinks: externalLinks.slice(0, 3).join(" • "),
            trailer: value.trailer
               ? value.trailer.site === "youtube"
                  ? `[youtube](https://www.youtube.com/watch?v=${value.trailer.id})`
                  : "N/A"
               : "N/A",
            nextAiringEpisode: value.nextAiringEpisode
               ? {
                    timeUntilAiring: new Date(
                       Date.now() + value.nextAiringEpisode.timeUntilAiring * 1000,
                    ),
                    episode: value.nextAiringEpisode.episode,
                 }
               : "concluded",
         });
      });

      const trendingData: TrendingData = {
         media,
         hasNext: fetchData.data.Page.pageInfo.hasNextPage,
      };

      return trendingData;
   }

   public getEmbedData(trendingData: TrendingData, currentPage: number) {
      const embedData: MessageEmbed[] = [];
      let popularity = getPopularity(currentPage, this.perPage);

      for (const data of trendingData.media) {
         const embed = new MessageEmbed()
            .setTitle(data.title)
            .setURL(data.siteUrl)
            .setColor(data.color)
            .setThumbnail(data.thumbnail)
            .setDescription(
               textJoin([
                  `**Trending rank** ↬ #${popularity}`,
                  `**Score** ↬ ${data.meanScore}`,
                  `**Trailer** ↬ ${data.trailer}`,
                  `**External links** ↬ ${data.externalLinks}`,
               ]),
            )
            .setFooter({
               text: `${
                  data.nextAiringEpisode === "concluded"
                     ? "Concluded"
                     : `ep ${data.nextAiringEpisode.episode} airing in ${parseMs(
                          data.nextAiringEpisode.timeUntilAiring.valueOf() - Date.now(),
                       )}`
               }`,
            });
         embedData.push(embed);
         popularity++;
      }

      return {
         embeds: embedData,
         hasNext: trendingData.hasNext,
      } as TrendingEmbedData;
   }
}

function getPopularity(currentPage: number, perPage: number) {
   return (currentPage - 1) * perPage + 1;
}

interface Query {
   data: {
      Page: {
         pageInfo: {
            hasNextPage: boolean;
         };
         media: {
            title: {
               english: string;
               romaji: string;
            };
            coverImage: {
               large: string;
               color: ColorResolvable;
            };
            nextAiringEpisode: {
               timeUntilAiring: number;
               episode: number;
            };
            externalLinks: {
               url: string;
               site: string;
            }[];
            trailer: {
               id: string;
               site: string;
            };
            siteUrl: string;
            meanScore: string;
         }[];
      };
   };
}

const query = /* GraphQL */ `
   query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
         pageInfo {
            hasNextPage
         }
         media(type: ANIME, sort: TRENDING_DESC) {
            title {
               english
               romaji
            }
            coverImage {
               large
               color
            }
            nextAiringEpisode {
               timeUntilAiring
               episode
            }
            externalLinks {
               url
               site
            }
            trailer {
               id
               site
            }
            siteUrl
            meanScore
         }
      }
   }
`;
