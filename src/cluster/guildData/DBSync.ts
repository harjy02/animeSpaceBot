import { Servers } from "./models/Servers";
import { container } from "@sapphire/pieces";
import { green } from "colorette";

export async function GuildDataDBSync() {
   await syncGuildData();
}

async function syncGuildData() {
   const guilds = await container.client.guilds.fetch();

   guilds.forEach(async (guild) => {
      const result = await Servers.findOne({ where: { id: guild.id } });

      if (!result) {
         await Servers.create({
            id: guild.id,
            name: guild.name,
            executedCommands: 0,
         });
      }
   });

   container.logger.info(green("GuildData synced"));
}
