import { container } from "@sapphire/pieces";
import { envEnviroment, envMysqlDatabaseUrl } from "assets/config";
import { Sequelize } from "sequelize";

export const GuildDataDB = new Sequelize(envMysqlDatabaseUrl, {
   logging: false
      ? envEnviroment === "development"
         ? (log) => container.logger.info(log)
         : false
      : false,
});

export async function GuildDataDBInit(force: boolean) {
   await GuildDataDB.sync({ force });
}
