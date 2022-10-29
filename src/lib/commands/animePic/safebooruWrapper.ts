import { ApplicationCommandOptionChoiceData, MessageEmbed } from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import fetch, { RequestInit } from "node-fetch";

async function getSafebooruPicCount(tag: string) {
   const requestInit: RequestInit = {
      method: "GET",
      redirect: "follow",
   };

   const fetchData = await fetch(
      `https://safebooru.donmai.us/counts/posts.json?tags=${tag}`,
      requestInit,
   )
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as PicCount;
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchData;
}

interface PicCount {
   counts: {
      posts: number;
   };
}

export async function generateSafebooruImageEmbed(tag: string) {
   const promiseData = await Promise.allSettled([
      getSafebooruRandomImage(tag),
      getSafebooruPicCount(tag),
   ]);

   const catchResponse = (text: any) => {
      catchNewError(text);
   };

   const imgData =
      promiseData[0].status === "fulfilled"
         ? promiseData[0].value
         : new Error(promiseData[0].reason);

   const countData =
      promiseData[1].status === "fulfilled"
         ? promiseData[1].value
         : catchResponse(promiseData[1].reason);

   if (imgData instanceof Error) throw imgData;

   if (!imgData) return null;

   const safebooruUrl = `https://safebooru.donmai.us/posts/${imgData.id}`;

   const source = imgData.pixiv_id
      ? `https://www.pixiv.net/en/artworks/${imgData.pixiv_id}`
      : imgData.source;

   const generalTags =
      imgData.tag_string_general.trim() === ""
         ? []
         : imgData.tag_string_general.split(" ");
   const characterTags =
      imgData.tag_string_character.trim() === ""
         ? []
         : imgData.tag_string_character.split(" ");
   const copyrightTags =
      imgData.tag_string_copyright.trim() === ""
         ? []
         : imgData.tag_string_copyright.split(" ");
   const artistTags =
      imgData.tag_string_artist.trim() === "" ? [] : imgData.tag_string_artist.split(" ");

   const count = (tagList: string[]) => {
      if (tagList.length > 4)
         return `[${tagList.length}](${safebooruUrl} "${tagList.join(" • ")}")) `;
      else return "";
   };

   const embed = new MessageEmbed()
      .setDescription(
         [
            "> Main info",
            `**Reference** ↬ [Safebooru](${safebooruUrl}) • [SourceUrl](${source})`,
            `**Full-size url** ↬ [FullPicture](${imgData.file_url})`,
            `**Upvote** ↬ [${imgData.score}](https://safebooru.donmai.us/post_votes?search[post_id]=${imgData.id}&variant=compact)`,
            `**Favourites** ↬ [${imgData.fav_count}](https://safebooru.donmai.us/posts/${imgData.id}/favorites)`,
            "",
            "> Tags",
            `**${count(generalTags)}Main general-tags** ↬ \`${
               generalTags.length > 0 ? generalTags.splice(0, 4).join("` • `") : "N/A"
            }\``,
            `**${count(characterTags)}Character-tags** ↬ \`${
               characterTags.length > 0 ? characterTags.splice(0, 4).join("` • `") : "N/A"
            }\``,
            `**${count(copyrightTags)}Copyright-tags** ↬ \`${
               copyrightTags.length > 0 ? copyrightTags.splice(0, 4).join("` • `") : "N/A"
            }\``,
            `**${count(artistTags)}Artist-tags** ↬ \`${
               artistTags.length > 0 ? artistTags.splice(0, 4).join("` • `") : "N/A"
            }\``,
            "",
         ].join("\n"),
      )
      .setImage(imgData.large_file_url || imgData.file_url);

   if (countData) {
      embed.setFooter({
         text: `Roll through ${countData.counts.posts} posts | searched tag: ${tag
            .split("+")
            .join(" • ")}`,
      });
   }

   return embed;
}

export async function getSafebooruRandomImage(tag: string) {
   const requestInit: RequestInit = {
      method: "GET",
      redirect: "follow",
   };

   const fetchData = await fetch(
      `https://safebooru.donmai.us/posts/random.json?tags=${tag}`,
      requestInit,
   )
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            if (response.statusText === "Not Found" || response.status === 404)
               return null;

            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as SafebooruRandomImage;
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchData;
}

export interface SafebooruRandomImage {
   id: number;
   created_at: Date;
   uploader_id: number;
   score: number;
   source: string;
   md5: string;
   last_comment_bumped_at: null;
   rating: string;
   image_width: number;
   image_height: number;
   tag_string: string;
   fav_count: number;
   file_ext: string;
   last_noted_at: null;
   parent_id: number;
   has_children: boolean;
   approver_id: null;
   tag_count_general: number;
   tag_count_artist: number;
   tag_count_character: number;
   tag_count_copyright: number;
   file_size: number;
   up_score: number;
   down_score: number;
   is_pending: boolean;
   is_flagged: boolean;
   is_deleted: boolean;
   tag_count: number;
   updated_at: Date;
   is_banned: boolean;
   pixiv_id: null;
   last_commented_at: null;
   has_active_children: boolean;
   bit_flags: number;
   tag_count_meta: number;
   has_large: boolean;
   has_visible_children: boolean;
   tag_string_general: string;
   tag_string_character: string;
   tag_string_copyright: string;
   tag_string_artist: string;
   tag_string_meta: string;
   file_url: string;
   large_file_url: string;
   preview_file_url: string;
}

export async function getSafebooruTagAutocomplete(search: string) {
   const list: ApplicationCommandOptionChoiceData[] = [];

   const tagList = await getSafebooruTagList(search);

   for (const eachTag of tagList) {
      list.push({
         name: `${eachTag.name} 〈${eachTag.post_count} entries〉`,
         value: `[${eachTag.name}]`,
      });
   }

   return list;
}

async function getSafebooruTagList(search: string) {
   const requestInit: RequestInit = {
      method: "GET",
      redirect: "follow",
   };

   const fetchData = await fetch(
      `https://safebooru.donmai.us/tags.json?search[hide_empty]=true&search[order]=count&search[name_matches]=${search}*`,
      requestInit,
   )
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as SafebooruTagOutput[];
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchData;
}

interface SafebooruTagOutput {
   id: number;
   name: string;
   post_count: number;
   category: number;
   created_at: string;
   updated_at: string;
   is_locked: boolean;
   is_deprecated: boolean;
}
