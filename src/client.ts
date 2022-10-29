import {
   ArgumentStore,
   CommandStore,
   ILogger,
   ListenerStore,
   LogLevel,
   PreconditionStore,
   SapphireClient,
} from "@sapphire/framework";

import { SlashCommandPreconditionStore } from "lib/slashCommands/framework/lib/structures/SlashCommandPreconditionStore";
import SlashCommandStore from "lib/slashCommands/framework/lib/structures/SlashCommandStore";
import { join } from "path";
import { loadWebserver } from "webServer/loaderWS";
import { ClusterInit } from "cluster/clusterInit";
import { ClusterSync } from "cluster/clusterSync";
import { envDiscordToken } from "assets/config";

declare module "@sapphire/pieces" {
   interface StoreRegistryEntries {
      "arguments": ArgumentStore;
      "commands": CommandStore;
      "slash-commands": SlashCommandStore;
      "listeners": ListenerStore;
      "preconditions": PreconditionStore;
      "slash-command-preconditions": SlashCommandPreconditionStore;
   }
}

export class AnimeSpaceClient {
   public client: SapphireClient;
   public logger: ILogger;

   constructor() {
      this.client = new SapphireClient({
         defaultPrefix: "-",
         caseInsensitiveCommands: true,
         caseInsensitivePrefixes: true,
         defaultCooldown: {
            delay: 3000,
         },
         logger: {
            level: LogLevel.Debug,
         },
         shards: "auto",
         intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
         partials: ["CHANNEL"],
      });

      this.logger = this.client.logger;
   }

   public async login() {
      try {
         await ClusterInit();
         await this.initializeWS();
         await this.registerStores();

         await this.client.login(envDiscordToken);

         await ClusterSync();
      } catch (error) {
         this.client.logger.fatal(error);
         this.client.destroy();
         process.exit(1);
      }
   }

   private async initializeWS() {
      await loadWebserver();
   }

   private registerStores() {
      this.client.stores.register(new SlashCommandStore());
      this.client.stores.register(new SlashCommandPreconditionStore());

      //leave this for last
      this.client.stores.registerPath(join(__dirname, "modules"));
   }
}
