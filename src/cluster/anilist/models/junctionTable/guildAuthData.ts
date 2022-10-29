import {
   Column,
   Default,
   ForeignKey,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import AuthData from "../authData";
import DiscordGuild from "../discordGuild";

@Table
export default class GuildAuthData extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @ForeignKey(() => DiscordGuild)
   @Column
   declare FK_Guild: string;

   @ForeignKey(() => AuthData)
   @Column
   declare FK_AuthData: string;
}
