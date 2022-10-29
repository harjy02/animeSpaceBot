import {
   AutocompleteInteraction,
   ButtonInteraction,
   CacheType,
   CommandInteraction,
   CommandInteractionOption,
   CommandInteractionOptionResolver,
   Constants,
   Interaction,
   ModalSubmitInteraction,
   SelectMenuInteraction,
} from "discord.js";
import { Listener, ListenerOptions, container, UserError } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { catchNewError } from "lib/errors/errorHandling";
import { Events } from "lib/slashCommands/framework/lib/types/Events";
import { ListenerManager } from "lib/slashCommands/listenerManager";
import { parseJson } from "lib/tools/text/parseJson";
import { envOwners, testingMode } from "assets/config";
import { asTree } from "lib/tools/treeify";
import { interactionLogger } from "lib/loggers/interactionLogger";
import { addCommandStatistics, addInteractionStatistics } from "assets/statLog";

@ApplyOptions<ListenerOptions>({
   event: Constants.Events.INTERACTION_CREATE,
})
export default class InteractionCreate extends Listener<
   typeof Constants.Events.INTERACTION_CREATE
> {
   private listenerManager = new ListenerManager();

   public run(interaction: Interaction): void {
      try {
         if (interaction.isCommand()) this.commandInteractionHandler(interaction);
         else if (interaction.isAutocomplete())
            this.autocompleteInteractionHandler(interaction);
         else if (
            interaction.isButton() ||
            interaction.isSelectMenu() ||
            interaction.isModalSubmit()
         )
            this.genericEventBasedHandler(interaction);

         const additionalLogData: string[] = [];

         const {
            type,
            id,
            applicationId,
            user,
            guild,
            channel,
            member,
            guildId,
            channelId,
            ...rest
         } = interaction;

         const logObj: { [k: string]: any } = {
            interaction: {
               ...rest,
            },
         };

         if (interaction.isAutocomplete()) {
            logObj.interaction = {
               commandName: interaction.commandName,
               options: getLogOptions(interaction.options.data),
            };
         }

         if (interaction.isMessageComponent()) {
            logObj.interaction = {
               customId: interaction.customId,
               componentType: interaction.componentType,
               deferred: interaction.deferred,
               ephemeral: interaction.ephemeral,
               replied: interaction.replied,
            };
         }

         if (interaction.isApplicationCommand()) {
            logObj.interaction = {
               commandName: interaction.commandName,
               deferred: interaction.deferred,
               ephemeral: interaction.ephemeral,
               replied: interaction.replied,
               options: getLogOptions(interaction.options.data),
            };

            additionalLogData.push(
               [
                  `- <span style="color:#9d4edd">Command info</span>`,
                  `   - Name: <span style="color:#3f8efc">${interaction.commandName}</span>`,
               ].join("\n"),
            );
         }

         const logObjTree = asTree(logObj);
         const logObjTreeLines = (logObjTree.match(/\n/g) || "").length + 1;

         const log = [
            `- <details><summary>Username: <span style="color:#c8553d">${user.username}</span></summary>`,
            "",
            `      Username: ${user.username}`,
            `      Id: ${user.id}`,
            `      Bot: ${user.bot}`,
            "",
            `   </details>`,
            `- <details><summary>Guild: <span style="color:#c8553d">${guild?.name}</span></summary>`,
            "",
            `      Name: ${guild?.name}`,
            `      Id: ${guild?.id}`,
            `      OwnerId: ${guild?.ownerId}`,
            "",
            `   </details>`,
            `- <details><summary>ChannelType: <span style="color:#9999a1">${channel?.type}</span></summary>`,
            "",
            `      ChannelType: ${channel?.type}`,
            `      Id: ${channel?.id}`,
            "",
            `   </details>`,
            ...additionalLogData,
            "",
            `<details><summary>OtherData (${logObjTreeLines})</summary>`,
            "",
            `\`\`\`bash`,
            logObjTree,
            `\`\`\``,
            "",
            `</details>`,
            "",
         ].join("\n");

         switch (type) {
            case "APPLICATION_COMMAND": {
               interactionLogger.commandInteraction(log, type);
               break;
            }
            default: {
               interactionLogger.otherInteraction(log, type);
               break;
            }
         }

         //for /stats command
         addInteractionStatistics(interaction.type);
         if (interaction.isCommand()) addCommandStatistics(interaction.commandName);
      } catch (error: any) {
         catchNewError(error);
      }
   }

   private async commandInteractionHandler(
      interaction: CommandInteraction,
   ): Promise<void> {
      const args = interaction.options as CommandInteractionOptionResolver<CacheType>;
      const { commandName } = interaction;
      const command = this.container.stores.get("slash-commands").get(commandName);

      if (testingMode && !envOwners.includes(interaction.user.id)) {
         interaction.reply(
            "The bot is currently being tested and cannot be used, try using it later",
         );
         return;
      }

      if (!command) {
         interaction.client.emit(Events.UnknownSlashCommand, {
            interaction,
            commandName,
         });

         return;
      }

      const context = { commandName };
      const payload = {
         interaction,
         command,
         parameters: interaction.options,
         context: { commandName },
      };

      // Run global preconditions:
      const globalResult = await this.container.stores
         .get("slash-command-preconditions")
         .run(interaction, command, context);

      if (!globalResult.success) {
         interaction.client.emit(
            Events.SlashCommandDenied as never,
            globalResult.error,
            payload,
         );

         return;
      }

      //client required permission check
      if (
         interaction.channel?.type !== "DM" &&
         command.options.requiredClientPermissions &&
         !command.options.requiredClientPermissions.every((permission) =>
            interaction.memberPermissions?.has(permission),
         )
      ) {
         const userError = new UserError({
            identifier: "permissionError",
            message: `To execute this command you need this permissions:\n ${command.options.requiredClientPermissions.join(
               " | ",
            )}`,
         });

         interaction.client.emit(Events.SlashCommandDenied as never, userError, payload);

         return;
      }

      // Run command-specific preconditions:
      const localResult = await command.preconditions.run(interaction, command, context);

      if (!localResult.success) {
         interaction.client.emit(
            Events.SlashCommandDenied as never,
            localResult.error,
            payload,
         );

         return;
      }

      try {
         interaction.client.emit(Events.SlashCommandRun as never, interaction, command, {
            ...payload,
            args,
         });

         const result = await command.run(interaction, args, context);

         interaction.client.emit(Events.SlashCommandSuccess as never, {
            ...payload,
            args,
            result,
         });
      } catch (error) {
         interaction.client.emit(Events.SlashCommandError as never, error, {
            ...payload,
            args,
            piece: command,
         });
      } finally {
         interaction.client.emit(
            Events.SlashCommandFinish as never,
            interaction,
            command,
            { ...payload, args },
         );
      }
   }

   private autocompleteInteractionHandler(interaction: AutocompleteInteraction) {
      try {
         const args = interaction.options as CommandInteractionOptionResolver<CacheType>;
         const { commandName } = interaction;
         const command = this.container.stores.get("slash-commands").get(commandName);

         if (!command) return;

         const context = { commandName };

         if (command.autocomplete) {
            command.autocomplete(interaction, args, context);
         } else {
            container.logger.error(
               `there isn't any autocomplete function in command ${interaction.commandName} to handle the autocomplete argument`,
            );
         }
      } catch (error: any) {
         catchNewError(error);
      }
   }

   private async genericEventBasedHandler(
      interaction: SelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction,
   ) {
      try {
         const customId = interaction.customId;
         const parsed = parseJson(customId) as CustomId | null;

         if (parsed) {
            if (this.listenerManager.hasListeners(parsed[0])) {
               try {
                  this.listenerManager.emit(parsed[0], interaction, parsed);
               } catch (error: any) {
                  catchNewError(error);
               }
            } else {
               container.logger.warn(
                  `${interaction.type}: ${interaction.customId} doesn't have a listener`,
               );
            }
         }
      } catch (error: any) {
         catchNewError(error);
      }
   }
}

type CustomId = [customId: string];

function getLogOptions(options: readonly CommandInteractionOption[]) {
   return options.map((value) => {
      const data: GetLogOptionsData = {
         name: value.name,
         type: value.type,
         value: value.value,
      };

      if (value.options) data.options = getLogOptions(value.options);

      return data;
   });
}

interface GetLogOptionsData {
   name: string;
   type: string;
   value?: string | number | boolean | undefined;
   options?: Record<any, any>;
}
