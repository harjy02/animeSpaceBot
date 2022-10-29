import { container } from "@sapphire/pieces";
import { removeServerActivity } from "cluster/anilist/libs/serverActivity";
import DiscordGuild from "cluster/anilist/models/discordGuild";
import UserData from "cluster/anilist/models/userData";
import type { DiscordAPIError, TextChannel } from "discord.js";
import { serverActivityDataCache } from "global/dbCache";
import { getActivity } from "lib/commands/serverActivity/getActivity";
import { now } from "moment";
import { scheduleJob } from "node-schedule";

scheduleJob("*/10 * * * *", async () => {
   if (container.client.isReady()) {
      for (const eachServerActivity of serverActivityDataCache) {
         //#region [args]

         const client = container.client;

         const guildId = eachServerActivity[0];
         const channelId = eachServerActivity[1].channelId;

         //#endregion

         const channel = (await client.channels
            .fetch(channelId)
            .catch((error: DiscordAPIError) => {
               if (error.httpStatus === 404) return null;
               if (error.httpStatus === 403) return null;
               throw error;
            })) as TextChannel | null;

         if (!channel) {
            removeServerActivity(guildId);
            break;
         }

         const userData = await UserData.findAll({
            include: [
               {
                  model: DiscordGuild,
                  as: "discordGuild",
                  where: { id: guildId },
                  required: true,
               },
            ],
         });

         const userDataIds = userData.map((userDataValue) => userDataValue.AL_Id);
         const activity = await getActivity(
            userDataIds,
            1,
            Math.round(now() / 1000) - 600,
         );

         if (activity.length > 0) {
            do await channel.send({ embeds: activity.splice(0, 10) });
            while (activity.length > 0);
         }
      }
   }
});
