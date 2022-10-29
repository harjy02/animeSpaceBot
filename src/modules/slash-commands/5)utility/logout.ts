import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { CommandInteraction } from "discord.js";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { supportServerInviteLink } from "assets/config";
import { getAuthData, removeAuthData } from "cluster/anilist/libs/authData";
import { getUserData, removeUserData } from "cluster/anilist/libs/userData";
import { getDiscordUser } from "cluster/anilist/libs/discordUser";
import {
   findOrCreateDiscordGuild,
   getDiscordGuild,
} from "cluster/anilist/libs/discordGuild";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "removes any type of authentication/connection to anilist (either from `/login` or `/connect`)",
      usage: "Run the command without any argument and it will logout",
   },
   enabled: true,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const author = interaction.user;
      const guild =
         interaction.channel?.type === "DM"
            ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
            : interaction.guild;

      //#endregion

      if (!guild) return interaction.reply("Command only executable in a guild or in DM");

      const authData = await getAuthData(guild.id, author.id);
      const userData = await getUserData(guild.id, author.id);

      const discordUser = await getDiscordUser(author.id);
      const discordGuild = await getDiscordGuild(guild.id);

      if ((!authData && !userData) || !discordUser || !discordGuild) {
         return interaction.reply("You don't have any anilist account connected");
      } else {
         let ok = false;

         if (userData) ok = await removeUserData(userData, discordUser, discordGuild);
         if (authData) ok = await removeAuthData(authData);

         if (ok) {
            return interaction.reply({
               content: "All your connections to anilist have been removed successfully",
               ephemeral: true,
            });
         } else {
            return interaction.reply(
               `There was some problem removing the connections, please report it in the ${supportServerInviteLink}`,
            );
         }
      }
   }
}
