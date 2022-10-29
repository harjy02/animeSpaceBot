import {
   Column,
   Default,
   ForeignKey,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import DiscordChannel from "../discordChannel";
import Anime from "../anime";

@Table
export default class DiscordChannelAnime extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @ForeignKey(() => DiscordChannel)
   @Column
   declare FK_DiscordChannel: string;

   @ForeignKey(() => Anime)
   @Column
   declare FK_Anime: string;
}
