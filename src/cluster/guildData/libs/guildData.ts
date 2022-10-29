import { Servers } from "../models/Servers";

export async function executedCommand(guildId: string, guildName: string, date: Date) {
   const result = await Servers.findOne({ where: { id: guildId } });

   if (result) {
      await await result.increment("executedCommands");
      await result.update(
         { lastExecutedCommand: date },
         {
            where: {
               id: guildId,
            },
         },
      );
      await result.reload();

      return {
         executedCommands: result.get("executedCommands"),
         lastExecutedCommand: result.get("lastExecutedCommand"),
      } as ReturnData;
   } else {
      await Servers.create({
         id: guildId,
         name: guildName,
         executedCommands: 1,
         lastExecutedCommand: date,
      });

      return {
         executedCommands: 1,
         lastExecutedCommand: date,
      } as ReturnData;
   }
}

interface ReturnData {
   executedCommands: number;
   lastExecutedCommand: Date;
}
