import {
   Table,
   Model,
   Column,
   BelongsToMany,
   PrimaryKey,
   DataType,
   Default,
} from "sequelize-typescript";
import DiscordGuild from "./discordGuild";
import DiscordUser from "./discordUser";
import GuildAuthData from "./junctionTable/guildAuthData";
import AuthDataDiscordUser from "./junctionTable/authDataDiscordUser";
import { UUIDV4 } from "sequelize";

@Table
export default class AuthData extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column(DataType.TEXT)
   declare accessToken: string;

   @Column(DataType.TEXT)
   declare refreshToken?: string;

   @BelongsToMany(() => DiscordUser, () => AuthDataDiscordUser)
   declare discordUser: DiscordUser[];

   @BelongsToMany(() => DiscordGuild, () => GuildAuthData)
   declare discordGuild: DiscordGuild[];
}
