import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { CommandInteraction } from "discord.js";
import { REST } from "@discordjs/rest";
import { envDiscordToken } from "assets/config";
import { Routes } from "discord-api-types/v10";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Testing`,
   },
   preconditions: ["OwnerOnly"],
   guildCommand: true,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const rest = new REST({ version: "9" }).setToken(envDiscordToken);

      await rest.put(Routes.applicationCommands(this.container.client.id!), {
         body: [],
      });

      await interaction.reply("Unregistered global slash commands");
   }
}
