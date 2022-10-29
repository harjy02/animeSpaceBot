import { container } from "@sapphire/pieces";
import { envEnviroment } from "assets/config";
import {
   getCommandStatistics,
   getInteractionStatistics,
   resetCommandStatistics,
   resetInteractionStatistics,
   statsLogChannelId,
} from "assets/statLog";
import { MessageEmbed, TextChannel } from "discord.js";
import { scheduleJob } from "node-schedule";

scheduleJob("0 */12 * * *", async () => {
   if (container.client.isReady() && envEnviroment === "production") {
      const statLogChannel = (await container.client.channels.fetch(
         statsLogChannelId,
      )) as TextChannel;

      const commandStats = getCommandStatistics().map(
         (value) => `${value.commandName}: ${value.count}`,
      );
      const interactionStats = getInteractionStatistics().map(
         (value) => `${value.InteractionName}: ${value.count}`,
      );

      const embed = new MessageEmbed().setDescription(
         [
            "Command usage statistics:",
            ...commandStats,
            "",
            "Interaction usage stats:",
            ...interactionStats,
         ].join("\n"),
      );

      await statLogChannel.send({ embeds: [embed] });

      resetCommandStatistics();
      resetInteractionStatistics();
   }
});
