import DiscordUser from "../models/discordUser";
import SauceNao from "../models/sauceNao";

export async function getSauceNao(discordUser: DiscordUser) {
   const search = await SauceNao.findOne({
      include: [
         {
            model: DiscordUser,
            as: "discordUser",
            where: {
               id: discordUser.id,
            },
         },
      ],
   });

   return search;
}

export async function createOrUpdateSauceNao(discordUser: DiscordUser, token: string) {
   const search = await SauceNao.findOne({
      include: [
         {
            model: DiscordUser,
            as: "discordUser",
            where: {
               id: discordUser.id,
            },
         },
      ],
   });

   if (search) {
      search.update({
         token,
      });

      return "updated";
   } else {
      const created = await SauceNao.create({
         token,
      });

      await created.$set<DiscordUser>("discordUser", discordUser);
      //await discordUser.$add("sauceNao", created);

      return "created";
   }
}
