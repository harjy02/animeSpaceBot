import { serverActivityDataCache } from "global/dbCache";
import { infoLogger } from "lib/loggers/info";
import ServerActivity from "../models/serverActivity";

export async function getServerActivity(guildId: string) {
   return serverActivityDataCache.get(guildId);
}

export async function removeServerActivity(guildId: string) {
   const guildSearch = await ServerActivity.findOne({ where: { guildId } });

   if (guildSearch) {
      await guildSearch.destroy();

      serverActivityDataCache.delete(guildId);

      infoLogger.info("ServerActivity", `[-] Removed server activity from guild ${guildId}`);

      return true;
   } else {
      return false;
   }
}

export async function setServerActivity(guildId: string, channelId: string) {
   const guildSearch = await ServerActivity.findOne({ where: { guildId } });

   const serverActivity = !guildSearch
      ? await ServerActivity.create({
           guildId,
           channelId,
        })
      : await guildSearch.update({ channelId });

   serverActivityDataCache.set(guildId, serverActivity);

   infoLogger.info("ServerActivity", `[+] Added server activity to guild ${guildId}`);

}
