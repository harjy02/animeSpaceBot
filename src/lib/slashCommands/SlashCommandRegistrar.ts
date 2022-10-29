import { APIApplicationCommandOption, Routes } from "discord-api-types/v9";
import type { ApplicationCommandOptionData, DiscordAPIError, Guild } from "discord.js";
import { SapphireClient, container } from "@sapphire/framework";
import { envDiscordToken, envSupportGuild } from "assets/config";
import { magenta, red, yellow } from "colorette";

import { catchNewError } from "lib/errors/errorHandling";
import { REST } from "@discordjs/rest";
import type { SlashCommand } from "./framework/lib/structures/SlashCommand";
import type SlashCommandStore from "./framework/lib/structures/SlashCommandStore";
import type { Snowflake } from "discord-api-types/globals";

export interface APIGuildApplicationCommand {
   id: Snowflake;
   application_id: Snowflake;
   name: string;
   description: string;
   version?: string;
   default_permission?: boolean;
   type?: number;
   guild_id: Snowflake;
   options?: APIApplicationCommandOption[];
}

interface APIApplicationCommand {
   application_id: Snowflake;
   guild_id?: Snowflake;
   name: string;
   description: string;
   options?: APIApplicationCommandOption[];
   default_permission?: boolean;
}

const ApplicationCommandOptionTypeMap: { [key: string]: number } = {
   SUB_COMMAND: 1,
   SUB_COMMAND_GROUP: 2,
   STRING: 3,
   INTEGER: 4,
   BOOLEAN: 5,
   USER: 6,
   CHANNEL: 7,
   ROLE: 8,
   MENTIONABLE: 9,
   NUMBER: 10,
   ATTACHMENT: 11,
};

export class SlashCommandRegistrar {
   private static instance: SlashCommandRegistrar;

   private rest!: REST;
   private client!: SapphireClient;
   private slashCommandStore!: SlashCommandStore;
   private globalSlashCommandData!: APIApplicationCommand[];
   private guildSlashCommandData!: Map<string, APIApplicationCommand[]>;

   public constructor(client: SapphireClient) {
      if (SlashCommandRegistrar.instance) return SlashCommandRegistrar.instance;

      this.rest = new REST({ version: "9" }).setToken(envDiscordToken);

      //__<initializeData>

      container.logger.info("-----------------------------");
      container.logger.info("Initializing slash commands data...");

      this.slashCommandStore = client.stores.get("slash-commands");
      const globalCommands = this.slashCommandStore.filter(
         (command) => !command.guildCommand,
      );
      const guildCommands = this.slashCommandStore.filter(
         (command) => command.guildCommand,
      );

      this.client = client;
      this.globalSlashCommandData = globalCommands.map(
         this.slashCommandToSlashCommandData.bind(this),
      );

      globalCommands.forEach((command) => {
         const descriptionLength = command.options.info.description.length;

         if (descriptionLength < 1 || command.options.info.description.length > 100) {
            throw new Error(
               `the length of the description in command ${command.name} is less than 1 or more than 100`,
            );
         }
      });

      guildCommands.forEach((command) => {
         const descriptionLength = command.options.info.description.length;

         if (descriptionLength < 1 || command.options.info.description.length > 100) {
            throw new Error(
               `the length of the description in command ${command.name} is less than 1 or more than 100`,
            );
         }
      });

      // this.guildSlashCommandData = guildCommands.map(
      //    this.slashCommandToSlashCommandData.bind(this),
      // );

      // const mappedCommands: [string, APIApplicationCommand[]][] = [];
      const mappedCommands: Map<string, APIApplicationCommand[]> = new Map();

      guildCommands.forEach((value) => {
         const id = value.guildId || envSupportGuild;

         if (Array.isArray(id)) {
            for (const each of id) {
               if (mappedCommands.has(each)) {
                  const guildCommandList = mappedCommands.get(each)!;

                  guildCommandList.push(
                     this.slashCommandToSlashCommandData.bind(this)(value),
                  );
               } else {
                  mappedCommands.set(each, [
                     this.slashCommandToSlashCommandData.bind(this)(value),
                  ]);
               }
            }

            return;
         }

         if (mappedCommands.has(id)) {
            const guildCommandList = mappedCommands.get(id)!;

            guildCommandList.push(this.slashCommandToSlashCommandData.bind(this)(value));
         } else {
            mappedCommands.set(id, [
               this.slashCommandToSlashCommandData.bind(this)(value),
            ]);
         }
      });

      this.guildSlashCommandData = mappedCommands;

      //this.guildSlashCommandData.

      // this.guildSlashCommandData = guildCommandMap.map((value) => [value[0], this.slashCommandToSlashCommandData.bind(value[1])])

      container.logger.info("Slash commands data initialized");
      container.logger.info("-----------------------------");

      //__</initializeData>

      SlashCommandRegistrar.instance = this;
   }

   public async testGuildRegister(): Promise<void> {
      try {
         const testGuild = this.client.guilds.cache.get(envSupportGuild)!;

         if (!testGuild) throw new Error("The test guild doesn't exist");

         const testGuildCommands = this.guildSlashCommandData.get(testGuild.id);

         if (!testGuildCommands) {
            return container.logger.info(
               red("No command found to register in the testGuild"),
            );
         }

         const slashCommandData = this.globalSlashCommandData
            .map((data) => {
               return { ...data, guild_id: testGuild.id };
            })
            .concat(
               testGuildCommands.map((data) => {
                  return { ...data, guild_id: testGuild.id };
               }),
            );

         await testGuild.commands.fetch().catch((error: DiscordAPIError) => {
            if (error.path.endsWith("/commands")) {
               throw new Error(
                  'The test guild doesn\'t have scope "application.commands" enabled',
               );
            }
         });

         (await this.rest.put(
            Routes.applicationGuildCommands(this.client.id!, testGuild.id),
            {
               body: slashCommandData,
            },
         )) as APIGuildApplicationCommand[];

         container.logger.info(
            red("testGuildRegister:") +
               `Successfully reloaded application slash commands for test-guild: ${yellow(
                  testGuild.name,
               )}`,
         );
      } catch (error: any) {
         catchNewError(error);
      }
   }

   public async globalRegister(): Promise<void> {
      try {
         await this.rest.put(Routes.applicationCommands(this.client.id!), {
            body: this.globalSlashCommandData,
         });

         container.logger.info(
            magenta("globalRegister:") +
               "Successfully reloaded application slash commands for global scope.",
         );
      } catch (error: any) {
         catchNewError(error);
      }
   }

   public async guildRegister() {
      try {
         const commandList = this.guildSlashCommandData;

         for (const each of commandList) {
            const guild = await container.client.guilds
               .fetch(each[0])
               .catch((error: DiscordAPIError) => {
                  throw error;
               });

            this.eachGuildRegister(guild, each[1]);
         }
      } catch (error: any) {
         catchNewError(error);
      }
   }

   private async eachGuildRegister(
      guild: Guild,
      inCommand: APIApplicationCommand[],
   ): Promise<void> {
      try {
         const enabled = await guild.commands.fetch().catch((error: DiscordAPIError) => {
            if (error.path.endsWith("/commands")) return false;
            else throw error;
         });

         if (enabled === false) {
            return container.logger.info(
               `guild ${guild.name} doesn't have scope "application.commands" enabled`,
            );
         }

         (await this.rest.put(
            Routes.applicationGuildCommands(this.client.id!, guild.id),
            { body: inCommand },
         )) as APIGuildApplicationCommand[];

         container.logger.info(
            `${red("GuildRegister:")} registered ${yellow(
               inCommand.length,
            )} commands to guild ${yellow(guild.name)}`,
         );
      } catch (error: any) {
         catchNewError(error);
      }
   }

   private slashCommandToSlashCommandData(
      slashCommand: SlashCommand,
   ): APIApplicationCommand {
      return {
         application_id: this.client.application!.id,
         guild_id: undefined,
         name: slashCommand.name,
         description: slashCommand.description,
         options: parseOptions(slashCommand.arguments),
         default_permission: slashCommand.defaultPermission,
      };
   }
}

function parseOptions(
   options: ApplicationCommandOptionData[],
): APIApplicationCommandOption[] {
   const result = options.map((argument) => {
      if (
         (argument.type === "SUB_COMMAND" || argument.type === "SUB_COMMAND_GROUP") &&
         argument.options
      ) {
         return {
            ...argument,
            type: ApplicationCommandOptionTypeMap[argument.type.toString()],
            options: parseOptions(argument.options!),
         };
      } else {
         return {
            ...argument,
            type: ApplicationCommandOptionTypeMap[argument.type.toString()],
         };
      }
   });
   return result;
}
