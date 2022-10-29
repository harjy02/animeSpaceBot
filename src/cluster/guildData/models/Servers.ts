import { DataTypes } from "sequelize";
import { GuildDataDB } from "../DBInit";

export const Servers = GuildDataDB.define(
   "Server",
   {
      id: {
         type: DataTypes.STRING,
         primaryKey: true,
         unique: true,
      },
      name: {
         type: DataTypes.STRING,
      },
      executedCommands: {
         defaultValue: 0,
         type: DataTypes.INTEGER,
      },
      lastExecutedCommand: {
         type: DataTypes.DATE,
      },
   },
   { timestamps: false },
);
