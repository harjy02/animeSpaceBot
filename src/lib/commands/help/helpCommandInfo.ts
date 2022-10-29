import { MessageEmbed } from "discord.js";
import { alertEmbed } from "lib/tools/error/alertEmbed";
import { container } from "@sapphire/pieces";
import { stringParam } from "lib/tools/text/stringParam";
import { textJoin } from "lib/tools/text/textJoin";

export async function helpCommandInfo(commandName: string) {
   const command = commandName
      ? container.stores.get("slash-commands").find((c) => c.name === commandName)
      : undefined;

   if (!command) {
      return alertEmbed(
         `The command you are searching for doesn't exist, type \`/help\` and check in the command list the one you are looking for.`,
      );
   }

   const cooldown = command.preconditions.entries.find(
      (value: any) => value.name === "Cooldown",
   ) as any;

   const embed = new MessageEmbed()
      .setColor("RED")
      .setTimestamp()
      .setTitle(`/${command.name}`)
      .setDescription(
         textJoin([
            `**◆ Category**: ${
               command.category ? command.category.split(")").pop() : "N/A"
            }`,
            `**◆ Cooldown**: ${cooldown ? cooldown.context.delay / 1000 + "s" : "N/A"}`,
         ]),
      )
      .addField(
         "> Description:",
         stringParam(command.options.info.description || "no description here..."),
      );

   const requirements = command.options.info.requirements;
   if (requirements) {
      if (Array.isArray(requirements))
         embed.addField("> Requirements:", stringParam(requirements.join("\n")));
      else embed.addField("> Requirements:", stringParam(requirements));
   }

   const usage = command.options.info.usage;
   if (usage) {
      if (Array.isArray(usage))
         embed.addField("> Usage info:", stringParam(usage.join("\n")));
      else embed.addField("> Usage info:", stringParam(usage));
   }

   const structure = command.options.info.structure;
   if (structure) {
      if (Array.isArray(structure))
         embed.addField("> Command structure:", stringParam(structure.join("\n")));
      else embed.addField("> command structure:", stringParam(structure));
   }

   const examples = command.options.info.example;
   if (examples) {
      if (Array.isArray(examples))
         embed.addField("> Examples of use:", stringParam(examples.join("\n")));
      else embed.addField("> Examples of use:", stringParam(examples));
   }

   return embed;
}
