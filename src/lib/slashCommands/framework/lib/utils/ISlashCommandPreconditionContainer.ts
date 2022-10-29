import type { Awaitable, Result, UserError } from "@sapphire/framework";

import type { CommandInteraction } from "discord.js";
import type { SlashCommand } from "../structures/SlashCommand";
import type { SlashCommandPreconditionContext } from "../structures/SlashCommandPrecondition";

export type SlashCommandPreconditionContainerResult = Result<unknown, UserError>;

export type SlashCommandPreconditionContainerReturn =
   Awaitable<SlashCommandPreconditionContainerResult>;

export type AsyncSlashCommandPreconditionContainerReturn =
   Promise<SlashCommandPreconditionContainerResult>;

export interface ISlashCommandPreconditionContainer {
   run(
      interaction: CommandInteraction,
      command: SlashCommand,
      context?: SlashCommandPreconditionContext,
   ): SlashCommandPreconditionContainerReturn;
}
