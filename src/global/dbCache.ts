import type ServerActivity from "cluster/anilist/models/serverActivity";
import "fuzzysort";

export const serverActivityDataCache: Map<string, ServerActivity> = new Map();

export const commandList: (Fuzzysort.Prepared | undefined)[] = [];

export const guildList: string[] = [];
export const guildListPrepared: Fuzzysort.Prepared[] = [];
