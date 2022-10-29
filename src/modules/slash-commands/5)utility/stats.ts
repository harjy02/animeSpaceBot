import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import { CommandInteraction, MessageEmbed } from "discord.js";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { parseMs } from "lib/tools/other/parseMs";
import os from "os";
import { version } from "process";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "This command will show the current bot statistics like guild count/ping/uptime etc..",
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const client = this.container.client;

      const osver = os.platform() + " " + os.release();
      const runtime = parseMs(client.uptime || 0);

      const sysuptime = parseMs(os.uptime() * 1000);

      const msg = await interaction.channel?.send(`Fetching stats...`);

      await interaction.reply({
         embeds: [
            new MessageEmbed()
               .setTitle(`${client.user?.username} Information`)
               .setDescription(
                  `\`\`\`yml\nName: ${client.user?.username}#${client.user?.discriminator} [${client.user?.id}]\nRuntime: ${runtime}\n\`\`\``,
               )
               .setFields([
                  {
                     name: "Bot stats",
                     value: `\`\`\`yml\nGuilds: ${client.guilds.cache.size} \nLangVer: ${version}\n\`\`\``,
                     inline: true,
                  },
                  {
                     name: "System stats",
                     value: `\`\`\`yml\nOS: ${osver}\nUptime: ${sysuptime}\nShards: ${client.ws.shards.size}\n\`\`\``,
                     inline: false,
                  },
                  {
                     name: "Ping stats",
                     value: `\`\`\`yml\nBOT: ${Math.floor(
                        msg
                           ? msg.createdAt.getTime() - interaction.createdAt.getTime()
                           : 999,
                     )}ms\nAPI: ${client.ws.ping}ms\`\`\``,
                     inline: false,
                  },
               ]),
         ],
      });
      msg?.delete();
   }
}
