import { ColorResolvable, MessageEmbed } from "discord.js";

import fetch from "node-fetch";
import moment from "moment";
import { parseMs } from "lib/tools/other/parseMs";
import { textJoin } from "lib/tools/text/textJoin";

export interface SeasonalMediaData {
   idAl: number;
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
export interface SeasonalData {
   media: SeasonalMediaData[];
   hasNext: boolean;
}

export interface SeasonalEmbedData {
   embeds: MessageEmbed[];
   hasNext: boolean;
   animeList: [idAl: number, title: string][];
}
export class Seasonal {
   private perPage: number;

   constructor(perPage: number) {
      this.perPage = perPage;
   }

   public getSeasonalData = async (page: number): Promise<SeasonalData> => {
      const perPage = this.perPage;

      const anilistOptions = {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
         },
         body: JSON.stringify({
            query: anilistQuery,
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
               return json as AnilistQuery;
            }
         })
         .catch((error) => {
            throw error;
         });

      const media: SeasonalMediaData[] = [];

      fetchData.data.Page.media.forEach((value) => {
         const externalLinks: string[] = [];
         value.externalLinks.forEach((value2) =>
            externalLinks.push(`[${value2.site}](${value2.url})`),
         );

         media.push({
            idAl: value.id,
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

      const seasonalData: SeasonalData = {
         media,
         hasNext: fetchData.data.Page.pageInfo.hasNextPage,
      };

      return seasonalData;
   };

   public getEmbedData(seasonalData: SeasonalData, currentPage: number) {
      const embedData: MessageEmbed[] = [];
      let popularity = getPopularity(currentPage, this.perPage);

      const idAlList: [number, string][] = [];

      for (const data of seasonalData.media) {
         idAlList.push([data.idAl, data.title]);

         const embed = new MessageEmbed()
            .setTitle(data.title)
            .setURL(data.siteUrl)
            .setColor(data.color)
            .setThumbnail(data.thumbnail)
            .setDescription(
               textJoin([
                  `**Seasonal rank** ↬ #${popularity}`,
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
         hasNext: seasonalData.hasNext,
         animeList: idAlList,
      } as SeasonalEmbedData;
   }
}

function getPopularity(currentPage: number, perPage: number) {
   return (currentPage - 1) * perPage + 1;
}

type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

interface SeasonYear {
   season: Season;
   year: string;
}

function getSeason(): SeasonYear {
   const currentMonth = moment().format("M");
   const currentYear = moment().format("Y");
   const month = parseInt(currentMonth);

   if (month >= 3 && month <= 5) {
      return {
         season: "SPRING",
         year: currentYear,
      };
   } else if (month >= 6 && month <= 8) {
      return {
         season: "SUMMER",
         year: currentYear,
      };
   } else if (month >= 9 && month <= 11) {
      return {
         season: "FALL",
         year: currentYear,
      };
   } else {
      return {
         season: "WINTER",
         year: currentYear,
      };
   }
}

interface AnilistQuery {
   data: {
      Page: {
         pageInfo: {
            hasNextPage: boolean;
         };
         media: {
            id: number;
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

const anilistQuery = /* GraphQL */ `
   query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
         pageInfo {
            hasNextPage
         }
         media(
            type: ANIME
            format: TV
            season: ${getSeason().season}
            seasonYear: ${getSeason().year}
            sort: POPULARITY_DESC
         ) {
            id
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
