import { MessageEmbed } from "discord.js";
import { stringParam } from "../text/stringParam";

export function alertEmbed(text: string) {
   return new MessageEmbed().setColor("YELLOW").setDescription(stringParam(text));
}
