import {
   Column,
   Default,
   ForeignKey,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import DiscordGuild from "../discordGuild";
import UserData from "../userData";

@Table
export default class GuildUserData extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @ForeignKey(() => DiscordGuild)
   @Column
   declare FK_Guild: string;

   @ForeignKey(() => UserData)
   @Column
   declare FK_UserData: string;
}
