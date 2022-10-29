import {
   Column,
   DataType,
   Default,
   HasOne,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";

import { UUIDV4 } from "sequelize";
import DiscordUser from "./discordUser";

@Table
export default class SauceNao extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column(DataType.TEXT)
   declare token: string;

   @HasOne(() => DiscordUser)
   declare discordUser: DiscordUser;
}
