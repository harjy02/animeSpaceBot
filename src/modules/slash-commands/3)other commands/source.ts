import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { CommandInteraction, Message, MessageButton, MessageEmbed } from "discord.js";
import { findOrCreateDiscordUser } from "cluster/anilist/libs/discordUser";
import { getSauceNao } from "cluster/anilist/libs/sauceNao";
import { ButtonRow } from "lib/discordComponents/button";
import { addSourceTokenButton } from "modules/listeners/client/interactions/commands/source/addToken.button";
import { disableComponent, setComponent } from "lib/discordComponents/component";
import { getSauceNaoSource, ResponseType } from "lib/commands/source/sauceNao";
import { arrowLeft, arrowRight } from "assets/emoji";
import { catchNewError } from "lib/errors/errorHandling";
import { supportServerInviteLink } from "assets/config";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Image source searcher`,
   },
   arguments: [
      {
         name: "change_api-key",
         description: "Add or change the SauceNao api-key required by the command",
         type: "SUB_COMMAND",
      },
      {
         name: "search",
         description: "The method search method (url or uploaded image)",
         type: "SUB_COMMAND",
         options: [
            {
               name: "url",
               description: "The url to search source for",
               type: "STRING",
            },
            {
               name: "upload-image",
               description: "Upload an image to search source for (img size < 8mb)",
               type: "ATTACHMENT",
            },
         ],
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      switch (interaction.options.getSubcommand()) {
         case "change_api-key": {
            this.changeApiKey(interaction);
            break;
         }
         case "search": {
            this.search(interaction);
            break;
         }
      }
   }

   private async changeApiKey(interaction: CommandInteraction) {
      const embed = new MessageEmbed()
         .setDescription(
            [
               "As the SauceNao API has a limited request per user service we require the single user to input their own SauceNao access-token in order to use the command",
               "",
               "> **To add the sauceNao token follow these steps:**",
               "**1)** Go to [SauceNao-login](https://saucenao.com/user.php) create an account and login",
               "**2)** Got to [SauceNao token](https://saucenao.com/user.php?page=search-api) and copy the `api key`",
               "**3)** Use the button below and input the SauceNao api key",
               "",
               "> **Below is an example of the api key you need to copy:**",
            ].join("\n"),
         )
         .setImage("https://i.imgur.com/eFiyAKJ.png")
         .setFooter({
            text: "Connecting the api-key will use up one (1) request from your daily usage limits, this is a one time thing",
         });

      const buttonRow = new ButtonRow([addSourceTokenButton()]);

      return interaction.reply({
         embeds: [embed],
         components: setComponent(buttonRow),
         ephemeral: true,
      });
   }

   private async search(interaction: CommandInteraction) {
      //#region [args]

      const userId = interaction.user.id;
      const userName = interaction.user.username;

      const imgUrl = interaction.options.getString("url", false);
      const imgAttachment = interaction.options.getAttachment("upload-image", false);

      //#endregion

      const discordUser = await findOrCreateDiscordUser({
         id: userId,
         username: userName,
      });

      const sauceNao = await getSauceNao(discordUser);

      if (!sauceNao) {
         const embed = new MessageEmbed()
            .setDescription(
               [
                  "As the SauceNao API has a limited request per user service we require the single user to input their own SauceNao access-token in order to use the command",
                  "",
                  "> **To add the sauceNao token follow these steps:**",
                  "**1)** Go to [SauceNao-login](https://saucenao.com/user.php) create an account and login",
                  "**2)** Got to [SauceNao token](https://saucenao.com/user.php?page=search-api) and copy the `api key`",
                  "**3)** Use the button below and input the SauceNao api key",
                  "",
                  "> **Below is an example of the api key you need to copy:**",
               ].join("\n"),
            )
            .setImage("https://i.imgur.com/eFiyAKJ.png")
            .setFooter({
               text: "Connecting the api-key will use up one (1) request from your daily usage limits, this is a one time thing",
            });

         const buttonRow = new ButtonRow([addSourceTokenButton()]);

         return interaction.reply({
            embeds: [embed],
            components: setComponent(buttonRow),
            ephemeral: true,
         });
      }

      if (!imgUrl && !imgAttachment) {
         return interaction.reply({
            content:
               "To search something input an image url or upload an image using the command arguments",
            ephemeral: true,
         });
      }

      //#region [args]

      const token = sauceNao.token;

      const url = imgUrl || imgAttachment?.url!;

      //#endregion

      if (
         !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g.test(
            url,
         )
      ) {
         return interaction.reply({
            content: "The passed url is not a valid http/https url",
            ephemeral: true,
         });
      }

      if (!/\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url)) {
         return interaction.reply({
            content: [
               "The passed link is not a valid image url",
               "A correct image url should end with the image extension ex:`https://i.imgur.com/ftz5J49.jpg`",
            ].join("\n"),
            ephemeral: true,
         });
      }

      await interaction.reply({
         content: "Processing your search...",
         ephemeral: true,
      });

      const foundSource = await getSauceNaoSource(token, url);

      if (foundSource.status !== ResponseType.ok) {
         if (foundSource.status === ResponseType.invalidToken) {
            const embed = new MessageEmbed()
               .setTitle("Invalid Api-key")
               .setColor("RED")
               .setDescription(
                  [
                     "The Api-key you've inputted is not valid, check that you have copied it right",
                     "Follow these instructions and try adding again the api-key with the button below",
                     "",
                     "**1)** Go to [SauceNao-login](https://saucenao.com/user.php) create an account and login",
                     "**2)** Got to [SauceNao api-key](https://saucenao.com/user.php?page=search-api) and copy the `api key`",
                     "**3)** Use the button below and input the SauceNao api key",
                     "",
                     `in case you have problems ask for help in the [bot support server](${supportServerInviteLink})`,
                  ].join("\n"),
               )
               .setFooter({
                  text: "Connecting the api-key will use up one (1) request from your daily usage limits, this is a one time thing",
               });

            const buttonRow = new ButtonRow([addSourceTokenButton()]);

            interaction.followUp({
               embeds: [embed],
               components: setComponent(buttonRow),
               ephemeral: true,
            });
         }
         if (foundSource.status === ResponseType.tooManyRequests) {
            const embed = new MessageEmbed().setDescription(
               [
                  "Too many requests were made from your SauceNao account",
                  "Check the usage count at [SauceNao usage](https://saucenao.com/user.php?page=search-usage)",
                  "",
                  `in case you have problems ask for help in the [bot support server](${supportServerInviteLink})`,
               ].join("\n"),
            );

            interaction.followUp({ embeds: [embed], ephemeral: true });
         }
      }

      const sourceData = foundSource.content!;

      if (!sourceData.results) {
         const embed = new MessageEmbed()
            .setDescription(
               [
                  "> **Searched image:**",
                  "The search didn't produce any relevant result",
                  "",
                  "> **User request left**",
                  `Requests left for next 30s ↬ \`${sourceData.short_remaining}\``,
                  `Requests left for next 24h ↬ \`${sourceData.long_remaining}\``,
               ].join("\n"),
            )
            .setColor("RED")
            .setThumbnail(url);

         return interaction.followUp({
            embeds: [embed],
            ephemeral: true,
         });
      }

      const listEmbed: MessageEmbed[] = [];

      listEmbed.push(
         new MessageEmbed()
            .setDescription(
               [
                  "> **Searched image:**",
                  `results_returned: ${sourceData.results_returned}`,
                  "",
                  "> **User request left**",
                  `Requests left for next 30s ↬ \`${sourceData.short_remaining}\``,
                  `Requests left for next 24h ↬ \`${sourceData.long_remaining}\``,
               ].join("\n"),
            )
            .setColor("BLURPLE")
            .setThumbnail(url),
      );

      let resultCount = 1;

      for (const eachResult of sourceData.results) {
         const data = eachResult.data;
         const header = eachResult.header;

         const urlList = data.ext_urls.map(
            (eachUrl) => `[${new URL(eachUrl).hostname}](${eachUrl} "${eachUrl}")`,
         );

         const description = [
            `> **Source result N° ${resultCount}**`,
            "",
            `**Similarity** ↬ ${eachResult.header.similarity}%`,
            `**Reference links** ↬ ${urlList.join(" • ")}`,
         ];

         if (data.title) description.push(`**Title** ↬ ${data.title}`);
         if (data.creator) description.push(`**Creator** ↬ ${data.creator}`);
         if (data.material) description.push(`**Material** ↬ ${data.material}`);
         if (data.characters) description.push(`**Characters** ↬ ${data.characters}`);

         const embed = new MessageEmbed()
            .setDescription(description.join("\n"))
            .setThumbnail(header.thumbnail)
            .setColor("ORANGE");

         resultCount++;

         listEmbed.push(embed);
      }

      const embedList: MessageEmbed[][] = [];
      const perPage = 2;

      for (let i = 0; i < listEmbed.length; i += perPage) {
         const chunk = listEmbed.slice(i, i + perPage);
         embedList.push(chunk);
      }

      const hasNext = (page: number) => embedList[page] !== undefined;
      let currentPage = 0;

      const pageRow = new ButtonRow([backPageButton, nextPageButton]);

      pageRow.hideButton([0]);
      if (!hasNext(currentPage + 1)) pageRow.hideButton([1]);

      const sent = (await interaction.followUp({
         embeds: embedList[currentPage],
         components: setComponent(pageRow),
         fetchReply: true,
      })) as Message;

      const collector = sent.createMessageComponentCollector({
         idle: 300000,
      });

      collector.on("collect", async (collectInteraction) => {
         if (collectInteraction.user.id !== userId) {
            return collectInteraction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         switch (collectInteraction.componentType) {
            case "BUTTON": {
               switch (collectInteraction.customId) {
                  case "nextPage": {
                     currentPage++;

                     //__<variables>

                     if (currentPage > 0) pageRow.showButton([0]);
                     if (!hasNext(currentPage + 1)) pageRow.hideButton([1]);
                     //__</variables>

                     return collectInteraction.update({
                        embeds: embedList[currentPage],
                        components: setComponent(pageRow),
                     });
                  }
                  case "backPage": {
                     currentPage--;

                     //__<variables>

                     if (currentPage === 0) pageRow.hideButton([0]);
                     pageRow.showButton([1]);
                     //__</variables>

                     return collectInteraction.update({
                        embeds: embedList[currentPage],
                        components: setComponent(pageRow),
                     });
                  }
               }
               break;
            }
         }
      });
      collector.on("end", (_listener, reason) => {
         switch (reason) {
            case "idle": {
               sent.edit({ components: disableComponent(pageRow) });
               break;
            }
            default: {
               throw catchNewError(reason);
            }
         }
      });
   }
}

const nextPageButton = new MessageButton()
   .setCustomId("nextPage")
   .setLabel("Next")
   .setEmoji(arrowRight.id)
   .setStyle("PRIMARY");

const backPageButton = new MessageButton()
   .setCustomId("backPage")
   .setLabel("Back")
   .setEmoji(arrowLeft.id)
   .setStyle("PRIMARY");
