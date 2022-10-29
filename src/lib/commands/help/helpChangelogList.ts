import type { TextChannel } from "discord.js";
import { changelogChannelId } from "assets/config";
import { container } from "@sapphire/pieces";
import { textJoin } from "lib/tools/text/textJoin";
import { textPaging } from "lib/tools/text/textPaging";

let changelogCache: string[] = [];

export async function helpChangelogList() {
   if (changelogCache.length > 0) return changelogCache;

   //#region [args]

   const changelogChannel = (await container.client.channels.fetch(
      changelogChannelId,
   )) as TextChannel;

   //#endregion

   const changelogContent: { content: string; media: string | null; date: Date }[] = [];

   (await changelogChannel.messages.fetch()).forEach((value) => {
      changelogContent.push({
         content: value.content,
         media:
            value.attachments.size > 0
               ? value.attachments.map((attachment) => attachment.url)[0]
               : null,
         date: value.createdAt,
      });
   });

   //building every single changelog in it's string

   const changelogDescription: string[] = [];

   for (const each of changelogContent) {
      changelogDescription.push(
         textJoin([
            `<t:${Math.round(each.date.getTime() / 1000)}:f>`,
            each.content,
            each.media ? `[Attached media](${each.media})` : "",
         ]),
      );
   }

   const returnable = textPaging(changelogDescription, "\n", 1000);

   changelogCache = returnable;

   return returnable;
}

export async function reloadChangelog() {
   changelogCache = [];

   await helpChangelogList();
}
