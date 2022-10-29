import { AnilistDBSync } from "./anilist/DBSync";
import { GuildDataDBSync } from "./guildData/DBSync";

export async function ClusterSync() {
   await AnilistDBSync();
   await GuildDataDBSync();
}
