import { Color, parseColor } from "lib/tools/other/parseColor";

import fetch from "node-fetch";

export async function getViewer(authId: string) {
   const anilistOptions = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: anilistQuery,
         variables: { userId: authId },
      }),
   };

   const data = await fetch("https://graphql.anilist.co", anilistOptions)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json.data.User as AnilistQuery;
         }
      })
      .catch((error) => {
         throw error;
      });

   const favouriteAnime: FavouriteData[] = [];
   const favouriteManga: FavouriteData[] = [];
   const favouriteCharacter: FavouriteData[] = [];

   data.favourites.anime.nodes.forEach((value) =>
      favouriteAnime.push({
         name: value.title.english || value.title.romaji,
         url: value.siteUrl,
      }),
   );

   data.favourites.manga.nodes.forEach((value) =>
      favouriteManga.push({
         name: value.title.english || value.title.romaji,
         url: value.siteUrl,
      }),
   );

   data.favourites.characters.nodes.forEach((value) =>
      favouriteCharacter.push({
         name: value.name.full,
         url: value.siteUrl,
      }),
   );

   const viewerData: ViewerData = {
      name: data.name,
      siteUrl: data.siteUrl,
      avatar: data.avatar.large,
      banner: data.bannerImage,
      profileColor: parseColor(data.options.profileColor),
      statistics: {
         anime: {
            count: data.statistics.anime.count,
            episodesWatched: data.statistics.anime.episodesWatched,
            meanScore: data.statistics.anime.meanScore,
         },
         manga: {
            count: data.statistics.manga.count,
            chaptersRead: data.statistics.manga.chaptersRead,
            meanScore: data.statistics.manga.meanScore,
         },
      },
      mostViewGenres: {
         anime:
            data.statistics.anime && data.statistics.anime.genres.length > 0
               ? data.statistics.anime.genres[0]
               : { genre: "N/A", count: 0 },
         manga:
            data.statistics.manga && data.statistics.manga.genres.length > 0
               ? data.statistics.manga.genres[0]
               : { genre: "N/A", count: 0 },
      },
      favourites: {
         anime: favouriteAnime,
         manga: favouriteManga,
         character: favouriteCharacter,
      },
   };

   return viewerData;
}

interface ViewerData {
   name: string;
   siteUrl: string;
   avatar: string;
   banner: string;
   profileColor: string;
   statistics: {
      anime: {
         count: number;
         episodesWatched: number;
         meanScore: number;
      };
      manga: {
         count: number;
         chaptersRead?: number;
         meanScore: number;
      };
   };
   mostViewGenres: {
      anime: {
         count: number;
         genre: string;
      };
      manga: {
         count: number;
         genre: string;
      };
   };
   favourites: {
      anime: FavouriteData[];
      manga: FavouriteData[];
      character: FavouriteData[];
   };
}

export interface FavouriteData {
   name: string;
   url: string;
}

interface AnilistQuery {
   name: string;
   siteUrl: string;
   avatar: {
      large: string;
   };
   bannerImage: string;
   options: {
      profileColor: Color;
   };
   favourites: {
      anime: {
         nodes: {
            title: {
               english: string;
               romaji: string;
            };
            siteUrl: string;
         }[];
      };
      manga: {
         nodes: {
            title: {
               english: string;
               romaji: string;
            };
            siteUrl: string;
         }[];
      };
      characters: {
         nodes: {
            name: {
               full: string;
            };
            siteUrl: string;
         }[];
      };
   };
   statistics: {
      anime: {
         count: number;
         episodesWatched: number;
         meanScore: number;
         genres: {
            count: number;
            genre: string;
         }[];
      };
      manga: {
         count: number;
         chaptersRead: number;
         meanScore: number;
         genres: {
            count: number;
            genre: string;
         }[];
      };
   };
}

const anilistQuery = /* GraphQL */ `
   query ($userId: Int) {
      User(id: $userId) {
         name
         siteUrl
         avatar {
            large
         }
         bannerImage
         options {
            profileColor
         }
         favourites {
            anime(page: 1, perPage: 6) {
               nodes {
                  title {
                     english
                     romaji
                  }
                  siteUrl
               }
            }
            manga(page: 1, perPage: 6) {
               nodes {
                  title {
                     english
                     romaji
                  }
                  siteUrl
               }
            }
            characters(page: 1, perPage: 6) {
               nodes {
                  name {
                     full
                  }
                  siteUrl
               }
            }
         }
         statistics {
            anime {
               count
               episodesWatched
               meanScore
               genres(limit: 1) {
                  count
                  genre
               }
            }
            manga {
               count
               chaptersRead
               meanScore
               genres(limit: 1) {
                  count
                  genre
               }
            }
         }
      }
   }
`;
