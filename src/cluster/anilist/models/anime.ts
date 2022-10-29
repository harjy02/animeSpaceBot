import {
   BelongsToMany,
   Column,
   Default,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";

import { UUIDV4 } from "sequelize";
import DiscordChannel from "./discordChannel";
import DiscordChannelAnime from "./junctionTable/discordChannelAnime";

@Table
export default class Anime extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column
   declare idMal: number;

   @Column
   declare idAl: number;

   @Column
   declare animeTitle: string;

   @Column
   declare airingTime: number; //in seconds

   @Column
   declare airingEpisode: number;

   @BelongsToMany(() => DiscordChannel, () => DiscordChannelAnime)
   declare discordChannel: DiscordChannel[];
}
