import {
   Table,
   Model,
   Column,
   Default,
   PrimaryKey,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";

@Table
export default class ServerActivity extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column
   declare guildId: string;

   @Column
   declare channelId: string;

}
