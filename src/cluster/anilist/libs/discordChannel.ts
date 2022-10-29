import type Anime from "../models/anime";
import DiscordChannel from "../models/discordChannel";
import type DiscordGuild from "../models/discordGuild";

export async function channelHasAnime(discordChannel: DiscordChannel, anime: Anime) {
   const result = await discordChannel.$has("anime", anime);
   return result;
}

export async function channelAddAnime(discordChannel: DiscordChannel, anime: Anime) {
   await discordChannel.$add("anime", anime);
}

export async function findOrCreateDiscordChannel(
   channelId: string,
   channelName: string,
   discordGuild: DiscordGuild,
) {
   const search = await DiscordChannel.findOne({ where: { id: channelId } });

   if (search) {
      return search;
   } else {
      const created = await DiscordChannel.create({
         id: channelId,
         name: channelName,
      });

      await created.$set("discordGuild", discordGuild);

      return created;
   }
}
