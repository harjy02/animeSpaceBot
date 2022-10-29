import { ScoreFormat, getAnilistData } from "./lib/anilistData";

import { textInline } from "lib/tools/text/textInline";
import { getUserData } from "cluster/anilist/libs/userData";
import { catchNewError } from "lib/errors/errorHandling";

export async function getMediaUserInfo(
   discordGuildId: string,
   discordUserId: string,
   idAl: number,
   type: "ANIME" | "MANGA",
): Promise<UserInfo> {
   try {
      const user = await getUserData(discordGuildId, discordUserId);

      if (user) {
         const userInfoData = await getAnilistData(user, idAl, type);
         const description = parseUserInfo(userInfoData);

         return {
            isInList: userInfoData.userData ? true : false,
            description,
         } as UserInfo;
      } else {
         return {
            isInList: false,
            description: `Anilist account not connected, use command \`connect\` to do it`,
         } as UserInfo;
      }
   } catch (error) {
      catchNewError(error);

      return {
         isInList: false,
         description: "There was some problem retrieving the data",
      };
   }
}

interface UserInfo {
   isInList: boolean;
   description: string;
}
export interface UserInfoData {
   userData:
      | {
           status: string;
           score: number;
           progress: number;
           scoreFormat: ScoreFormat;
        }
      | undefined;
   name: string;
   siteUrl: string;
}

function parseUserInfo(userInfo: UserInfoData) {
   if (userInfo.userData) {
      return textInline([
         [
            {
               step: `**Score** ↬ ${parseScoreFormat(
                  userInfo.userData.score,
                  userInfo.userData.scoreFormat,
               )}`,
               spacing: 35.1,
            },
            {
               step: `**User** ↬ **[${userInfo.name}](${userInfo.siteUrl})**`,
               spacing: 0,
            },
         ],
         [
            {
               step: `**Progress** ↬ \`${userInfo.userData.progress}\``,
               spacing: 28,
            },
            {
               step: "**Source** ↬ `Anilist`",
               spacing: 0,
            },
         ],
         [
            {
               step: `**Status** ↬ \`${userInfo.userData.status}\``,
               spacing: 0,
            },
         ],
      ]);
   } else {
      return textInline([
         [
            {
               step: "**Site** ↬ `Anilist`",
               spacing: 28,
            },
            {
               step: `**User** ↬ **[${userInfo.name}](${userInfo.siteUrl})**`,
               spacing: 0,
            },
         ],
         [
            {
               step: "**Status** ↬ Media not in list!",
               spacing: 0,
            },
         ],
      ]);
   }
}

function parseScoreFormat(score: number, scoreFormat: ScoreFormat) {
   switch (scoreFormat) {
      case "POINT_100": {
         return `**\`${score}\`**_\`/100\`_`;
      }
      case "POINT_10_DECIMAL": {
         return `**\`${score}\`**_\`/10\`_`;
      }
      case "POINT_10": {
         return `**\`${score}\`**_\`/10\`_`;
      }
      case "POINT_5": {
         return `**\`${score}\`**_\`/5\`_`;
      }
      case "POINT_3": {
         return `**\`${score}\`**_\`/3\`_`;
      }
   }
}
