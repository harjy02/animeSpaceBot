import {
   BelongsToMany,
   Column,
   Default,
   HasMany,
   Model,
   PrimaryKey,
   Table,
} from "sequelize-typescript";

import AuthData from "./authData";
import DiscordUser from "./discordUser";
import GuildAuthData from "./junctionTable/guildAuthData";
import GuildDiscordUser from "./junctionTable/guildDiscordUser";
import GuildUserData from "./junctionTable/guildUserData";
import { UUIDV4 } from "sequelize";
import UserData from "./userData";
import DiscordChannel from "./discordChannel";

@Table
export default class DiscordGuild extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column
   declare name: string;

   @BelongsToMany(() => UserData, () => GuildUserData)
   declare userData: UserData[];

   @BelongsToMany(() => AuthData, () => GuildAuthData)
   declare authData: AuthData[];

   @BelongsToMany(() => DiscordUser, () => GuildDiscordUser)
   declare discordUser: DiscordUser[];

   @HasMany(() => DiscordChannel)
   declare discordChannel: DiscordChannel[];
}
