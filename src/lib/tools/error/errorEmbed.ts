import { MessageEmbed } from "discord.js";
import { stringParam } from "../text/stringParam";

export function errorEmbed(text: string) {
   return new MessageEmbed().setColor("RED").setDescription(stringParam(text));
}
