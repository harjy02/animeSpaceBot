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
import DiscordUser from "../discordUser";

@Table
export default class AuthDataDiscordUser extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @ForeignKey(() => AuthData)
   @Column
   declare FK_AuthData: string;

   @ForeignKey(() => DiscordUser)
   @Column
   declare FK_DiscordUser: string;
}
