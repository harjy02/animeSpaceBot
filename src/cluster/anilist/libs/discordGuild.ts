import { Guild } from "discord.js";
import DiscordGuild from "../models/discordGuild";

export async function getDiscordGuild(discordGuildId: string) {
   const search = await (await DiscordGuild).findOne({
      where: { id: discordGuildId },
   });

   return search;
}

export async function setDiscordGuild(
   guild:
      | {
           id: string;
           name: string;
        }
      | Guild,
) {
   const guildId = guild instanceof Guild ? guild.id : guild.id;
   const guildName = guild instanceof Guild ? guild.name : guild.name;

   const search = await DiscordGuild.findOne({
      where: { id: guildId },
   });

   if (!search) {
      const created = await DiscordGuild.create({
         id: guildId,
         name: guildName,
      });

      return created;
   } else {
      const updated = await search.update({
         id: guildId,
         name: guildName,
      });

      return updated;
   }
}

export async function findOrCreateDiscordGuild(
   guild:
      | {
           id: string;
           name: string;
        }
      | Guild,
) {
   const guildId = guild instanceof Guild ? guild.id : guild.id;

   const find = await getDiscordGuild(guildId);

   if (!find) {
      const create = await setDiscordGuild(guild);
      return create;
   } else {
      return find;
   }
}
