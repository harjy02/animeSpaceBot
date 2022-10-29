import "@sapphire/framework";
import "lib/slashCommands/framework/lib/structures/SlashCommand";

declare module "@sapphire/framework" {
   interface CommandOptions {
      requirements?: string;
      usage?: string | string[];
      structure?: string | string[];
      example?: string | string[];
   }
   interface Preconditions {
      OwnerOnly: never;
      Beta: never;
   }
}

export interface SlashCommandInfo {
   description: string;
   requirements?: string;
   usage?: string | string[];
   structure?: string | string[];
   example?: string | string[];
}

declare module "lib/slashCommands/framework/lib/structures/SlashCommand" {
   interface SlashCommandOptions {
      info: SlashCommandInfo;
   }
}

declare module "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition" {
   interface SlashCommandPreconditions {
      Beta: never;
   }
}