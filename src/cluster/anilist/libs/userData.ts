import DiscordGuild from "../models/discordGuild";
import DiscordUser from "../models/discordUser";
import UserData from "../models/userData";

export async function getUserData(discordGuildId: string, discordUserId: string) {
   const search = await UserData.findOne({
      include: [
         {
            model: DiscordGuild,
            as: "discordGuild",
            where: { id: discordGuildId },
         },

         {
            model: DiscordUser,
            as: "discordUser",
            where: { id: discordUserId },
         },
      ],
   });

   return search;
}

export async function removeUserData(
   userData: UserData,
   discordUser: DiscordUser,
   discordGuild: DiscordGuild,
) {
   if (userData) {
      await userData.$remove<DiscordUser>("discordUser", discordUser.id);

      const users = await UserData.count({
         include: [
            {
               model: DiscordGuild,
               as: "discordGuild",
               where: { id: discordGuild.id },
               required: true,
            },
            {
               model: DiscordUser,
               as: "discordUser",
               required: true,
            },
         ],
      });

      if (users < 1)
         await userData.$remove<DiscordGuild>("discordGuild", discordGuild.id);

      return true;
   } else {
      return false;
   }
}

export async function setUserData(
   discordGuild: DiscordGuild,
   discordUser: DiscordUser,
   AL_Username: string,
   AL_Id: string,
) {
   const search = await UserData.findOne({
      include: [
         {
            model: DiscordGuild,
            as: "discordGuild",
            where: { id: discordGuild.id },
         },

         {
            model: DiscordUser,
            as: "discordUser",
            where: { id: discordUser.id },
         },
      ],
   });

   if (!search) {
      const userData =
         (await UserData.findOne({ where: { AL_Id } })) ||
         (await UserData.create({ AL_Id, AL_Username }));

      await userData.$add<DiscordGuild>("discordGuild", discordGuild);
      await userData.$add<DiscordUser>("discordUser", discordUser);

      return userData;
   } else {
      const updated = await search.update({ AL_Id, AL_Username });

      return updated;
   }
}
