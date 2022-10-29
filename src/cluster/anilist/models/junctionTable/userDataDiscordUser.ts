import {
   Column,
   Default,
   ForeignKey,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import DiscordUser from "../discordUser";
import UserData from "../userData";

@Table
export default class UserDataDiscordUser extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @ForeignKey(() => UserData)
   @Column
   declare FK_UserData: string;

   @ForeignKey(() => DiscordUser)
   @Column
   declare FK_DiscordUser: string;
}
