import type {
   ISlashCommandPreconditionContainer,
   SlashCommandPreconditionContainerReturn,
} from "./ISlashCommandPreconditionContainer";
import type {
   SimpleSlashCommandPreconditionKeys,
   SlashCommandPreconditionContext,
   SlashCommandPreconditionKeys,
   SlashCommandPreconditions,
} from "../structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import type { SlashCommand } from "../structures/SlashCommand";
import { container } from "@sapphire/pieces";

export interface SimpleSlashCommandPreconditionSingleResolvableDetails {
   name: SimpleSlashCommandPreconditionKeys;
}

export interface SlashCommandPreconditionSingleResolvableDetails<
   K extends SlashCommandPreconditionKeys = SlashCommandPreconditionKeys,
> {
   name: K;
   context: SlashCommandPreconditions[K];
}

export type SlashCommandPreconditionSingleResolvable =
   | SimpleSlashCommandPreconditionKeys
   | SimpleSlashCommandPreconditionSingleResolvableDetails
   | SlashCommandPreconditionSingleResolvableDetails;

export class SlashCommandPreconditionContainerSingle
   implements ISlashCommandPreconditionContainer {
   public readonly context: Record<PropertyKey, unknown>;
   public readonly name: string;

   public constructor(data: SlashCommandPreconditionSingleResolvable) {
      if (typeof data === "string") {
         this.context = {};
         this.name = data;
      } else {
         this.context = Reflect.get(data, "context") ?? {};
         this.name = data.name;
      }
   }

   public run(
      interaction: CommandInteraction,
      command: SlashCommand,
      context: SlashCommandPreconditionContext = {},
   ): SlashCommandPreconditionContainerReturn {
      const precondition = container.stores
         .get("slash-command-preconditions")
         .get(this.name);

      if (precondition)
         return precondition.run(interaction, command, { ...context, ...this.context });

      throw new Error(`The precondition "${this.name}" is not available.`);
   }
}
