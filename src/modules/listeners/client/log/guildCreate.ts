import type { Guild } from "discord.js";
import { Listener } from "@sapphire/framework";
import { asTree } from "lib/tools/treeify";
import { guildLogger } from "lib/loggers/guildLogger";

export default class extends Listener {
   public async run(guild: Guild) {
      const data: CommandLog = {
         guildName: guild.name,
         guildId: guild.id,
      };

      const treeData = asTree(data);

      this.container.logger.warn("Client guild joined:");
      this.container.logger.warn(treeData);

      guildLogger.guildJoin(treeData);
   }
}

interface CommandLog {
   guildName: string;
   guildId: string;
}
