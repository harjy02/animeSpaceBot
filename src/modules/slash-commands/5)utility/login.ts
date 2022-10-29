import { anilist_credential, envEnviroment } from "assets/config";
import {
   CommandInteraction,
   MessageActionRow,
   MessageButton,
   MessageEmbed,
} from "discord.js";
import { pkceCodeMap, stateCodeMap } from "global/webServer";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import pkceChallenge from "pkce-challenge";
import { textJoin } from "lib/tools/text/textJoin";
import { loginModal } from "modules/listeners/client/interactions/commands/loginDev/login.modal";
import { ButtonRow } from "lib/discordComponents/button";
import { setComponent } from "lib/discordComponents/component";
import { loginButton } from "modules/listeners/client/interactions/commands/loginDev/login.button";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

@ApplyOptions<SlashCommandOptions>({
   info: {
      // description: `This command allows users to connect their anilist to the bot via authentication, this is only needed if user wants to use command that require authentication, else it's more than enough using the classic \`connect\``,
      description:
         "This command allows users to connect their anilist to the bot via authentication",
      usage: `Run the command \`/login\` without any argument and then follow the instructions`,
   },
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

      if (!guild) return interaction.reply("command executable only in a guild or in dm");

      const state = pkceChallenge();
      const pkce = pkceChallenge();

      const anilist = `https://anilist.co/api/v2/oauth/authorize?client_id=${anilist_credential.client_id}&redirect_uri=${anilist_credential.redirect_url}&response_type=code&state=${state.code_challenge}`;
      //const myAnimeList = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${MyAnimeList_credential.client_id}&code_challenge=${pkce.code_challenge}&state=${state.code_challenge}`;

      const anilistButton = new MessageButton()
         .setLabel("Anilist")
         .setURL(anilist)
         .setStyle("LINK");

      /*
         const myAnimeListButton = new MessageButton()
            .setLabel("MyAnimeList")
            .setURL(myAnimeList)
            .setStyle("LINK");
            */
      const buttonArray: MessageButton[] = [anilistButton];

      if (envEnviroment === "development") buttonArray.push(loginButton());

      const buttonRow = new ButtonRow(buttonArray);

      const embed = new MessageEmbed()
         .setColor("#FF5733")
         .setTitle("Authentication instructions")
         .setDescription(
            textJoin([
               `This type of authentication is only needed if you want to use command like \`/addanime\` witch require the user to be authenticated, if you are ok with just the classic other command than using \`/connect <username>\`is sufficient`,
               "",
               "Select one of the following sources you wanna authenticate with, click on it and follow the instructions on your browser",
            ]),
         )
         .setTimestamp(new Date());

      await interaction.reply({
         embeds: [embed],
         components: setComponent(buttonRow),
         ephemeral: true,
      });

      stateCodeMap.set(state.code_challenge, {
         author,
         guild,
      });
      setTimeout(() => stateCodeMap.delete(state.code_challenge), 480000);

      pkceCodeMap.set(state.code_challenge, pkce.code_challenge);
      setTimeout(() => pkceCodeMap.delete(state.code_challenge), 420000);
   }
}
