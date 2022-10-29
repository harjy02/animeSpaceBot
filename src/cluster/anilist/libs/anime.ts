import Anime from "../models/anime";

import { setAiringSchedule } from "lib/commands/airing/airingSchedule";

export async function findOrCreateAnime(animeData: {
   idMal: number | null;
   id: number;
   title: string;
   nextAiringEpisode: {
      airingAt: number;
      episode: number;
   };
}) {
   const searched = await Anime.findOne({ where: { idAl: animeData.id } });

   if (searched) {
      return searched;
   } else {
      const created = await Anime.create({
         idMal: animeData.idMal,
         idAl: animeData.id,
         animeTitle: animeData.title,
         airingTime: animeData.nextAiringEpisode.airingAt,
         airingEpisode: animeData.nextAiringEpisode.episode,
      });

      await setAiringSchedule(created);

      return created;
   }
}
