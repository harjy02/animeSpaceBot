import { APIApplicationCommandOption, Routes, Snowflake } from "discord-api-types/v9";
import type { Args, CommandOptions } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { BotMessageCommand } from "lib/class/botMessageCommand";
import type { Message } from "discord.js";
import { REST } from "@discordjs/rest";
import { envDiscordToken } from "assets/config";

@ApplyOptions<CommandOptions>({
   aliases: ["test"],
   description: "null",
   preconditions: ["OwnerOnly"],
   requiredClientPermissions: ["SEND_MESSAGES"],
})
export default class extends BotMessageCommand {
   async messageRun(message: Message, _args: Args): Promise<Message | void> {
      const rest = new REST({ version: "9" }).setToken(envDiscordToken);

      await rest.put(Routes.applicationCommands(this.container.client.id!), {
         body: [],
      });

      await message.reply("Unregistered global slash commands");
   }
}
