import { Awaitable, BucketScope, Result, UserError, err, ok } from "@sapphire/framework";
import { Piece, PieceContext, PieceOptions } from "@sapphire/pieces";

import type { CommandInteraction } from "discord.js";
import type { SlashCommand } from "./SlashCommand";
import { SlashCommandPreconditionError } from "../errors/SlashCommandPreconditionError";

export type SlashCommandPreconditionResult = Awaitable<Result<unknown, UserError>>;
export type AsyncSlashCommandPreconditionResult = Promise<Result<unknown, UserError>>;

export abstract class SlashCommandPrecondition extends Piece {
   public readonly position: number | null;

   public constructor(
      context: PieceContext,
      options: SlashCommandPrecondition.Options = {},
   ) {
      super(context, options);
      this.position = options.position ?? null;
   }

   public abstract run(
      interaction: CommandInteraction,
      command: SlashCommand,
      context: SlashCommandPrecondition.Context,
   ): SlashCommandPrecondition.Result;

   public ok(): SlashCommandPrecondition.Result {
      return ok();
   }

   public error(
      options: Omit<SlashCommandPreconditionError.Options, "precondition"> = {},
   ): SlashCommandPrecondition.Result {
      return err(new SlashCommandPreconditionError({ precondition: this, ...options }));
   }
}

/**
 * The registered preconditions and their contexts, if any. When registering new ones, it is recommended to use
 * [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) so
 * custom ones are registered.
 *
 * When a key's value is `never`, it means that it does not take any context, which allows you to pass its identifier as
 * a bare string (e.g. `preconditions: ['NSFW']`), however, if context is required, a non-`never` type should be passed,
 * which will type {@link SlashCommandPreconditionContainerArray#append} and require an object with the name and a
 * `context` with the defined type.
 *
 * @example
 * ```typescript
 * declare module '@sapphire/framework' {
 *   interface Preconditions {
 *     // A precondition named `Moderator` which does not read `context`:
 *     Moderator: never;
 *
 *     // A precondition named `ChannelPermissions` which does read `context`:
 *     ChannelPermissions: {
 *       permissions: Permissions;
 *     };
 *   }
 * }
 *
 * // [✔] These are valid:
 * preconditions.append('Moderator');
 * preconditions.append({ name: 'Moderator' });
 * preconditions.append({
 *   name: 'ChannelPermissions',
 *   context: { permissions: new Permissions(8) }
 * });
 *
 * // [X] These are invalid:
 * preconditions.append({ name: 'Moderator', context: {} });
 * // ➡ `never` keys do not accept `context`.
 *
 * preconditions.append('ChannelPermissions');
 * // ➡ non-`never` keys always require `context`, a string cannot be used.
 *
 * preconditions.append({
 *   name: 'ChannelPermissions',
 *   context: { unknownProperty: 1 }
 * });
 * // ➡ mismatching `context` properties, `{ unknownProperty: number }` is not
 * // assignable to `{ permissions: Permissions }`.
 * ```
 */
export interface SlashCommandPreconditions {
   Cooldown: {
      scope?: BucketScope;
      delay: number;
      limit?: number;
   };
   DMOnly: never;
   Enabled: never;
   GuildNewsOnly: never;
   GuildNewsThreadOnly: never;
   GuildOnly: never;
   GuildPrivateThreadOnly: never;
   GuildPublicThreadOnly: never;
   GuildTextOnly: never;
   GuildThreadOnly: never;
   NSFW: never;
   OwnerOnly: never;
}

export type SlashCommandPreconditionKeys = keyof SlashCommandPreconditions;
export type SimpleSlashCommandPreconditionKeys = {
   [K in SlashCommandPreconditionKeys]: SlashCommandPreconditions[K] extends never
      ? K
      : never;
}[SlashCommandPreconditionKeys];

export interface SlashCommandPreconditionOptions extends PieceOptions {
   /**
    * The position for the precondition to be set at in the global precondition list. If set to `null`, this
    * precondition will not be set as a global one.
    *
    * @default null
    */
   position?: number | null;
}

export interface SlashCommandPreconditionContext extends Record<PropertyKey, unknown> {
   external?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SlashCommandPrecondition {
   export type Options = SlashCommandPreconditionOptions;
   export type Context = SlashCommandPreconditionContext;
   export type Result = SlashCommandPreconditionResult;
   export type AsyncResult = AsyncSlashCommandPreconditionResult;
}
