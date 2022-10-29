import { isOk, ok } from "@sapphire/framework";

import type { ISlashCommandPreconditionCondition } from "./ISlashCommandPreconditionCondition";
import type { SlashCommandPreconditionContainerResult } from "../ISlashCommandPreconditionContainer";

export const SlashCommandPreconditionConditionOr: ISlashCommandPreconditionCondition = {
   async sequential(interaction, command, entries, context) {
      let error: SlashCommandPreconditionContainerResult | null = null;

      for (const child of entries) {
         const result = await child.run(interaction, command, context);

         if (isOk(result))
            return result;


         error = result;
      }

      return error ?? ok();
   },

   async parallel(interaction, command, entries, context) {
      const results = await Promise.all(
         entries.map((entry) => entry.run(interaction, command, context)),
      );
      let error: SlashCommandPreconditionContainerResult | null = null;

      for (const result of results) {
         if (isOk(result))
            return result;


         error = result;
      }

      return error ?? ok();
   },
};
