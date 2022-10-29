import {
   BelongsTo,
   BelongsToMany,
   Column,
   Default,
   ForeignKey,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";

import { UUIDV4 } from "sequelize";
import DiscordGuild from "./discordGuild";
import Anime from "./anime";
import DiscordChannelAnime from "./junctionTable/discordChannelAnime";

@Table
export default class DiscordChannel extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column
   declare name: string;

   @Column
   declare channelNotificationRoleId: string;

   @ForeignKey(() => DiscordGuild)
   @Column
   declare FK_DiscordGuild: string;

   @BelongsTo(() => DiscordGuild)
   declare discordGuild: DiscordGuild;

   @BelongsToMany(() => Anime, () => DiscordChannelAnime)
   declare anime: Anime[];
}
