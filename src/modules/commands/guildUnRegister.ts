import { APIApplicationCommandOption, Routes, Snowflake } from "discord-api-types/v9";
import type { Args, CommandOptions } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { BotMessageCommand } from "lib/class/botMessageCommand";
import type { Message } from "discord.js";
import { REST } from "@discordjs/rest";
import { envDiscordToken, envSupportGuild } from "assets/config";

export interface APIGuildApplicationCommand {
   id: Snowflake;
   application_id: Snowflake;
   name: string;
   description: string;
   version?: string;
   default_permission?: boolean;
   type?: number;
   guild_id: Snowflake;
   options?: APIApplicationCommandOption[];
}

@ApplyOptions<CommandOptions>({
   aliases: ["test"],
   description: "null",
   preconditions: ["OwnerOnly"],
   requiredClientPermissions: ["SEND_MESSAGES"],
})
export default class extends BotMessageCommand {
   async messageRun(message: Message, _args: Args): Promise<Message | void> {
      const testGuild = this.container.client.guilds.cache.get(envSupportGuild)!;

      const rest = new REST({ version: "9" }).setToken(envDiscordToken);

      await rest.put(
         Routes.applicationGuildCommands(this.container.client.id!, testGuild.id),
         {
            body: [],
         },
      );

      await message.reply("Unregistered test guild commands");
   }
}
