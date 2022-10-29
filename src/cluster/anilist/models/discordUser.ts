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

import AuthData from "./authData";
import AuthDataDiscordUser from "./junctionTable/authDataDiscordUser";
import DiscordGuild from "./discordGuild";
import GuildDiscordUser from "./junctionTable/guildDiscordUser";
import { UUIDV4 } from "sequelize";
import UserData from "./userData";
import UserDataDiscordUser from "./junctionTable/userDataDiscordUser";
import SauceNao from "./sauceNao";

@Table
export default class DiscordUser extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column
   declare name: string;

   @BelongsToMany(() => UserData, () => UserDataDiscordUser)
   declare userData: UserData[];

   @BelongsToMany(() => AuthData, () => AuthDataDiscordUser)
   declare authData: AuthData[];

   @BelongsToMany(() => DiscordGuild, () => GuildDiscordUser)
   declare discordGuild: DiscordGuild[];

   @ForeignKey(() => SauceNao)
   @Column
   declare sauceNaoId: string;

   @BelongsTo(() => SauceNao)
   declare sauceNao: SauceNao;
}
