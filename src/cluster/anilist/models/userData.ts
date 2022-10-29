import {
   Table,
   Model,
   Column,
   BelongsToMany,
   PrimaryKey,
   Default,
} from "sequelize-typescript";
import DiscordGuild from "./discordGuild";
import DiscordUser from "./discordUser";
import GuildUserData from "./junctionTable/guildUserData";
import UserDataDiscordUser from "./junctionTable/userDataDiscordUser";
import { UUIDV4 } from "sequelize";

@Table
export default class UserData extends Model {
   @PrimaryKey
   @Default(UUIDV4)
   @Column
   declare id: string;

   @Column
   declare AL_Username: string;

   @Column
   declare AL_Id: string;

   @BelongsToMany(() => DiscordUser, () => UserDataDiscordUser)
   declare discordUser: DiscordUser[];

   @BelongsToMany(() => DiscordGuild, () => GuildUserData)
   declare discordGuild: DiscordGuild[];
}
