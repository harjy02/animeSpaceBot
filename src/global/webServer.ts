import type { User } from "discord.js";

export interface StateData {
   author: User;
   guild: { id: string; name: string };
}

export const pkceCodeMap: Map<string, string> = new Map();
export const stateCodeMap: Map<string, StateData> = new Map();
