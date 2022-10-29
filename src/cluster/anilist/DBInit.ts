import { container } from "@sapphire/pieces";
import { envMysqlDatabaseUrl, envEnviroment } from "assets/config";
import { catchNewError } from "lib/errors/errorHandling";
import { getAllFiles } from "lib/tools/getAllFiles";
import { DataType, Sequelize } from "sequelize-typescript";
import type { QueryInterface } from "sequelize";

export const AnilistDataDB = new Sequelize(envMysqlDatabaseUrl, {
   logging: false
      ? envEnviroment === "development"
         ? (log) => container.logger.info(log)
         : false
      : false,
});

export async function AnilistDBInit(force: boolean) {
   const folderContent = getAllFiles(__dirname + "/models/");

   const filteredFolderContent = folderContent.filter((files) => !files.endsWith(".map"));

   const modelList = [];

   for (const eachFile of filteredFolderContent) {
      const importedClass = require(eachFile).default;
      modelList.push(importedClass);
   }

   await AnilistDataDB.addModels(modelList);

   if (false) {
      const queryInterface = AnilistDataDB.getQueryInterface();
      await migrate(queryInterface);
   }

   await AnilistDataDB.sync({ force }).catch((error) => {
      catchNewError(error);
   });
}

async function migrate(queryInterface: QueryInterface) {
   /*
   await queryInterface.dropTable("DiscordGuildAnimes");
   await queryInterface.dropTable("DiscordUserAnimes");
   */
  /*
   await queryInterface.removeColumn("DiscordGuilds", "ServerAiringNotificationRole");
   await queryInterface.removeColumn("DiscordGuilds", "ServerAiringChannelId");
   await queryInterface.addColumn("DiscordUsers", "sauceNaoId", DataType.STRING);
   */
}
