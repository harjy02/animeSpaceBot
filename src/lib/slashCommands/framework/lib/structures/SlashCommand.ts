import { AliasPiece, PieceContext, PieceOptions } from "@sapphire/pieces";
import type {
   ApplicationCommandOptionData,
   ApplicationCommandPermissionData,
   AutocompleteInteraction,
   CommandInteraction,
   CommandInteractionOptionResolver,
   PermissionResolvable,
} from "discord.js";
import { BucketScope, CommandOptionsRunType } from "@sapphire/framework";
import {
   SlashCommandPreconditionContainerArray,
   SlashCommandPreconditionEntryResolvable,
} from "../utils/SlashCommandPreconditionContainerArray";

import type { Awaitable } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { SlashCommandInfo } from "global/implementations";

export abstract class SlashCommand<
   T = CommandInteractionOptionResolver,
> extends AliasPiece<SlashCommandOptions> {
   public description: string;
   public category: string | null;
   public preconditions: SlashCommandPreconditionContainerArray;
   public arguments: ApplicationCommandOptionData[];
   public guildCommand: boolean;
   public guildId?: string | string[];
   public defaultPermission: boolean;
   public permissions: ApplicationCommandPermissionData[];

   protected constructor(context: PieceContext, options: SlashCommandOptions) {
      super(context, { ...options, name: (options.name ?? context.name).toLowerCase() });
      this.description = options.info.description ?? "";
      this.category = this.location.directories[0] || null;
      this.arguments = options.arguments ?? [];
      this.guildCommand =
         (options.permissions?.length as number) > 0
            ? true
            : (options.guildCommand as boolean);
      this.guildId = options.guildId;
      this.defaultPermission = options.defaultPermission ?? true;
      this.permissions = options.permissions ?? [];

      this.preconditions = new SlashCommandPreconditionContainerArray(
         options.preconditions,
      );
      this.parseConstructorPreConditions(options);
   }

   public abstract run(
      interaction: CommandInteraction,
      args: T,
      context: SlashCommandContext,
   ): Awaitable<unknown>;

   public autocomplete?(
      interaction: AutocompleteInteraction,
      args: T,
      context: SlashCommandContext,
   ): Awaitable<unknown>;

   public toJSON2(): Record<string, any> {
      return {
         ...super.toJSON(),
         description: this.description,
         arguments: this.arguments,
         defaultPermission: this.defaultPermission,
         permissions: this.permissions,
         guildCommand: this.guildCommand,
      };
   }

   protected parseConstructorPreConditions(options: SlashCommandOptions): void {
      this.parseConstructorPreConditionsRunIn(options);
      this.parseConstructorPreConditionsNsfw(options);
      this.parseConstructorPreConditionsCooldown(options);
   }

   protected parseConstructorPreConditionsNsfw(options: SlashCommandOptions): void {
      if (options.nsfw)
         this.preconditions.append(SlashCommandPreConditions.NotSafeForWork);
   }

   protected parseConstructorPreConditionsRunIn(options: SlashCommandOptions): void {
      const runIn = this.resolveConstructorPreConditionsRunType(options.runIn);

      if (runIn !== null) this.preconditions.append(runIn as any);
   }

   protected parseConstructorPreConditionsCooldown(options: SlashCommandOptions): void {
      const limit = options.cooldownLimit ?? 1;
      const delay = options.cooldownDelay ?? 3000;

      if (limit && delay) {
         this.preconditions.append({
            name: SlashCommandPreConditions.Cooldown,
            context: { scope: options.cooldownScope ?? BucketScope.User, limit, delay },
         });
      }
   }

   private resolveConstructorPreConditionsRunType(
      runIn: SlashCommandOptions["runIn"],
   ): SlashCommandPreconditionContainerArray | SlashCommandPreConditions | null {
      if (isNullish(runIn)) return null;

      if (typeof runIn === "string") {
         switch (runIn) {
            case "DM":
               return SlashCommandPreConditions.DirectMessageOnly;

            case "GUILD_TEXT":
               return SlashCommandPreConditions.GuildTextOnly;

            case "GUILD_NEWS":
               return SlashCommandPreConditions.GuildNewsOnly;

            case "GUILD_NEWS_THREAD":
               return SlashCommandPreConditions.GuildNewsThreadOnly;

            case "GUILD_PUBLIC_THREAD":
               return SlashCommandPreConditions.GuildPublicThreadOnly;

            case "GUILD_PRIVATE_THREAD":
               return SlashCommandPreConditions.GuildPrivateThreadOnly;

            case "GUILD_ANY":
               return SlashCommandPreConditions.GuildOnly;

            default:
               return null;
         }
      }

      // If there's no channel it can run on, throw an error:
      if (runIn.length === 0) {
         throw new Error(
            `${this.constructor.name}[${this.name}]: "runIn" was specified as an empty array.`,
         );
      }

      if (runIn.length === 1)
         return this.resolveConstructorPreConditionsRunType(runIn[0]);

      const keys = new Set(runIn);

      const dm = keys.has("DM");
      const guildText = keys.has("GUILD_TEXT");
      const guildNews = keys.has("GUILD_NEWS");
      const guild = guildText && guildNews;

      // If runs everywhere, optimise to null:
      if (dm && guild) return null;

      const guildPublicThread = keys.has("GUILD_PUBLIC_THREAD");
      const guildPrivateThread = keys.has("GUILD_PRIVATE_THREAD");
      const guildNewsThread = keys.has("GUILD_NEWS_THREAD");
      const guildThreads = guildPublicThread && guildPrivateThread && guildNewsThread;

      // If runs in any thread, optimise to thread-only:
      if (guildThreads && keys.size === 3)
         return SlashCommandPreConditions.GuildThreadOnly;

      const preconditions = new SlashCommandPreconditionContainerArray();

      if (dm) preconditions.append(SlashCommandPreConditions.DirectMessageOnly);

      if (guild) {
         preconditions.append(SlashCommandPreConditions.GuildOnly);
      } else {
         // GuildText includes PublicThread and PrivateThread
         if (guildText) {
            preconditions.append(SlashCommandPreConditions.GuildTextOnly);
         } else {
            if (guildPublicThread)
               preconditions.append(SlashCommandPreConditions.GuildPublicThreadOnly);

            if (guildPrivateThread)
               preconditions.append(SlashCommandPreConditions.GuildPrivateThreadOnly);
         }

         // GuildNews includes NewsThread
         if (guildNews) preconditions.append(SlashCommandPreConditions.GuildNewsOnly);
         else if (guildNewsThread)
            preconditions.append(SlashCommandPreConditions.GuildNewsThreadOnly);
      }

      return preconditions;
   }
}

export const enum SlashCommandPreConditions {
   Cooldown = "Cooldown",
   DirectMessageOnly = "DMOnly",
   GuildNewsOnly = "GuildNewsOnly",
   GuildNewsThreadOnly = "GuildNewsThreadOnly",
   GuildOnly = "GuildOnly",
   GuildPrivateThreadOnly = "GuildPrivateThreadOnly",
   GuildPublicThreadOnly = "GuildPublicThreadOnly",
   GuildTextOnly = "GuildTextOnly",
   GuildThreadOnly = "GuildThreadOnly",
   NotSafeForWork = "NSFW",
}

export interface SlashCommandOptions extends PieceOptions {
   info: SlashCommandInfo;
   arguments?: ApplicationCommandOptionData[];
   guildCommand?: boolean;
   guildId?: string | string[];
   defaultPermission?: boolean;
   permissions?: ApplicationCommandPermissionData[];
   preconditions?: readonly SlashCommandPreconditionEntryResolvable[];
   nsfw?: boolean;
   cooldownLimit?: number;
   cooldownDelay?: number;
   cooldownScope?: BucketScope;
   requiredClientPermissions?: PermissionResolvable[];
   runIn?: CommandOptionsRunType | readonly CommandOptionsRunType[] | null;
}

export interface SlashCommandContext extends Record<PropertyKey, unknown> {
   commandName: string;
}
