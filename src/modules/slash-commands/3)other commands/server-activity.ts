import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { NewsChannel, CommandInteraction, TextChannel } from "discord.js";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import {
   getServerActivity,
   removeServerActivity,
   setServerActivity,
} from "cluster/anilist/libs/serverActivity";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "Set a channel where the anilist activity from server users will be displayed",
      usage: [
         "this command has 2 sub-commands:",
         " • **channel-set** ↬ Sets the channel in which the activity will be sent",
         " • **channel-remove** ↬ Removes the channel that has been set with the previous command",
      ],
   },
   arguments: [
      {
         name: "channel-set",
         description:
            "set a channel where the anilist activity from server users will be displayed",
         type: "SUB_COMMAND",
         options: [
            {
               name: "channel",
               description: "the channel where to set the activity list",
               type: "CHANNEL",
               channel_types: [0, 5],
               required: true,
            },
         ],
      },
      {
         name: "channel-remove",
         description: "removes the (setted) channel from displaying the anilist activity",
         type: "SUB_COMMAND",
      },
   ],
   requiredClientPermissions: ["MANAGE_CHANNELS"],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      switch (interaction.options.getSubcommand()) {
         case "channel-set": {
            return this.subCommandSet(interaction);
         }
         case "channel-remove": {
            return this.subCommandRemove(interaction);
         }
      }
   }

   public async subCommandRemove(interaction: CommandInteraction) {
      //#region [args]

      const guildId = interaction.guildId;

      //#endregion

      if (guildId) {
         const activity = await getServerActivity(guildId);

         if (activity) {
            const channel = (await interaction.guild!.channels.fetch(
               activity.channelId,
            )) as TextChannel;

            await removeServerActivity(guildId);

            interaction.reply({
               content: `removed channel <#${channel.id}> from displaying anilist activity`,
               ephemeral: true,
            });

            channel.send({
               content:
                  "Channel removed from displaying the anilist activity of the connected users",
            });
         } else {
            interaction.reply({
               content:
                  "There isn't any channel set up for viewing the connected user activity in this server",
               ephemeral: true,
            });
         }
      } else {
         interaction.reply("command can only be executed in a guild");
      }
   }

   public async subCommandSet(interaction: CommandInteraction) {
      //#region [args]

      const guildId = interaction.guildId;
      const guild = interaction.guild;
      const channel = interaction.options.getChannel("channel") as
         | TextChannel
         | NewsChannel;

      //#endregion

      if (!guild) {
         return interaction.reply({
            content: "This command can be run only in a guild/server",
            ephemeral: true,
         });
      }

      if (!channel) {
         return interaction.reply({
            content: "channel not found or not reachable",
            ephemeral: true,
         });
      }

      if (!channel.viewable) {
         return interaction.reply({
            content:
               "The bot doesn't have permission to view the activity channel you choose, give permissions or change the channel",
            ephemeral: true,
         });
      }

      if (!guild.me?.permissionsIn(channel).has("SEND_MESSAGES")) {
         return interaction.reply({
            content:
               "The bot doesn't have permission to send messages in the activity channel you choose, give permissions or change the channel",
            ephemeral: true,
         });
      }

      if (channel.type !== "GUILD_TEXT" && channel.type !== "GUILD_NEWS") {
         return interaction.reply({
            content: "select a text channel, the selected channel type is not valid",
            ephemeral: true,
         });
      }

      if (guildId) {
         await setServerActivity(guildId, channel.id);

         interaction.reply({
            content: `set up <#${channel.id}> for viewing the server connected user activity`,
            ephemeral: true,
         });

         channel.send({
            content:
               "Channel set up for serverActivity: every 10 minutes if there is any new activity of any connected user in this server it will be shown here",
         });
      } else {
         interaction.reply("command can only be executed in a guild");
      }
   }
}
