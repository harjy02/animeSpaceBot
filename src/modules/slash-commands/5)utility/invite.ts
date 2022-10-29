import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import {
   CommandInteraction,
   MessageActionRow,
   MessageButton,
   MessageEmbed,
} from "discord.js";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { botLogo, inviteLink } from "assets/config";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "This command will show the invite link of the bot, it can be used to invite the bot to other servers",
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const embed = new MessageEmbed()
         .setTitle("Invite link")
         .setThumbnail(botLogo)
         .setDescription(
            `Link to invite the bot: [bot link](${inviteLink})\nSupport server: [Anime Space](https://discord.gg/sYAceP6Pmf)`,
         )
         .setTimestamp();

      const urlButton = new MessageButton()
         .setLabel("Invite Anime Space Bot")
         .setURL(inviteLink)
         .setStyle("LINK");

      await interaction.reply({
         embeds: [embed],
         components: [new MessageActionRow().addComponents([urlButton])],
      });
   }
}
