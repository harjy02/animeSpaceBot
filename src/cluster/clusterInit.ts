import { AnilistDBInit } from "./anilist/DBInit";
import { GuildDataDBInit } from "./guildData/DBInit";

export async function ClusterInit() {
   await AnilistDBInit(false);
   await GuildDataDBInit(false);
}
