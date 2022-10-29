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
import DiscordUser from "../discordUser";

@Table
export default class GuildDiscordUser extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @ForeignKey(() => DiscordGuild)
   @Column
   declare FK_Guild: string;

   @ForeignKey(() => DiscordUser)
   @Column
   declare FK_DiscordUser: string;
}
