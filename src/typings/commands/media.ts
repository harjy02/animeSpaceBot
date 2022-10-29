import type { MessageEmbed } from "discord.js";

export interface MediaIdentifier {
   idMal: number;
   idAl: number;
}

export interface MediaData {
   embed: MessageEmbed;
   mediaTitle: string;
   identifier: MediaIdentifier;
}

export interface CharacterIdentifier {
   name: string;
   id: number;
}

export interface CharacterData {
   embed: MessageEmbed;
   identifier: CharacterIdentifier;
}
