import { User } from "discord.js";
import DiscordUser from "../models/discordUser";

export async function getDiscordUser(discordUserId: string) {
   const search = await DiscordUser.findOne({
      where: { id: discordUserId },
   });

   return search;
}

export async function setDiscordUser(
   user:
      | {
           id: string;
           username: string;
        }
      | User,
) {
   const userId = user instanceof User ? user.id : user.id;
   const userName = user instanceof User ? user.username : user.username;

   const search = await DiscordUser.findOne({
      where: { id: userId },
   });

   if (!search) {
      const created = await DiscordUser.create({
         id: userId,
         name: userName,
      });

      return created;
   } else {
      const updated = await search.update({
         id: userId,
         name: userName,
      });

      return updated;
   }
}

export async function findOrCreateDiscordUser(
   user:
      | {
           id: string;
           username: string;
        }
      | User,
) {
   const userId = user instanceof User ? user.id : user.id;

   const find = await getDiscordUser(userId);

   if (!find) {
      const create = await setDiscordUser(user);
      return create;
   } else {
      return find;
   }
}
