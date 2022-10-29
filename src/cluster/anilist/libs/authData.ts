import AuthData from "../models/authData";
import DiscordGuild from "../models/discordGuild";
import DiscordUser from "../models/discordUser";

export async function getAuthData(discordGuildId: string, discordUserId: string) {
   const search = await AuthData.findOne({
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

export async function removeAuthData(authData: AuthData) {
   if (authData) {
      await authData.destroy();

      return true;
   } else {
      return false;
   }
}

export async function setAuthData(
   discordGuild: DiscordGuild,
   discordUser: DiscordUser,
   accessToken: string,
   refreshToken: string,
) {
   const search = await AuthData.findOne({
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
      const authData =
         (await AuthData.findOne({ where: { accessToken } })) ||
         (await AuthData.create({ accessToken, refreshToken }));

      await authData.$add<DiscordGuild>("discordGuild", discordGuild);
      await authData.$add<DiscordUser>("discordUser", discordUser);

      return authData;
   } else {
      const updated = await search.update({ accessToken, refreshToken });

      return updated;
   }
}
