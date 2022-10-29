import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { CommandInteraction } from "discord.js";
import { reloadLib } from "lib/reloadLib";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Testing`,
   },
   preconditions: ["OwnerOnly"],
   guildCommand: true,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      this.container.stores.get("slash-commands").unloadAll();
      this.container.stores.get("slash-commands").loadAll();
      this.container.stores.get("listeners").unloadAll();
      this.container.stores.get("listeners").loadAll();

      reloadLib();

      interaction.reply("reload done!");
   }
}
