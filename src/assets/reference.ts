import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

export const anilistUrl = "[anilist](https://anilist.co/home)";

export const dmGuild = findOrCreateDiscordGuild({ id: "0", name: "DM" });
