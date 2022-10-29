import { Events, Listener, Store } from "@sapphire/framework";
import { blue, gray, magenta, magentaBright, red, white, yellow } from "colorette";

import { SlashCommandRegistrar } from "lib/slashCommands/SlashCommandRegistrar";
import { commandList, guildList, guildListPrepared } from "global/dbCache";
import fuzzysort from "fuzzysort";
import { envEnviroment } from "assets/config";
import { catchNewError } from "lib/errors/errorHandling";
import { getAllFiles } from "lib/tools/getAllFiles";

const dev = envEnviroment === "development";

export class UserEvent extends Listener<typeof Events.ClientReady> {
   private readonly style = dev ? yellow : blue;

   public async run() {
      const client = this.container.client;
      const nbGuilds = client.guilds.cache.size;

      this.container.logger.info(
         `Logged in as ${yellow(client.user!.username)}${magenta(
            "#" + client.user!.discriminator,
         )}`,
      );
      this.container.logger.info(
         `Serving in ${yellow(nbGuilds)} guild${nbGuilds > 1 ? "s" : ""}`,
      );
      const link = client.generateInvite({
         permissions: [],
         scopes: ["bot", "applications.commands"],
      });
      this.container.logger.info(`Invite link: ${link}`);

      await this.printBanner();
      await this.printStoreDebugInformation();
      await this.registerCommands();
      await this.registerCommandList();

      if (dev) await this.execTests();

      const guilds = await this.container.client.guilds.fetch();
      guilds.forEach((each) => {
         guildList.push(each.id);
         guildListPrepared.push(fuzzysort.prepare(each.id));
      });
   }

   private async execTests() {
      const folderContent = getAllFiles(__dirname + "/../../test/");

      const filteredFolderContent = folderContent.filter(
         (files) => !files.endsWith(".map"),
      );

      for (const eachFile of filteredFolderContent) {
         const importedClass = require(eachFile).default;
         const instanceClass = new importedClass();
         await instanceClass.run().catch((error: Error) => {
            catchNewError(error);
         });
      }
   }

   private registerCommandList() {
      this.container.stores.get("slash-commands").forEach((command) => {
         if (command.category?.startsWith("_")) return;
         commandList.push(fuzzysort.prepare(command.name));
      });
   }

   private async registerCommands() {
      const slashCommandRegistrar = new SlashCommandRegistrar(this.container.client);

      if (dev) {
         this.container.logger.info(red("Developer mode"));
         await slashCommandRegistrar.testGuildRegister();
      }

      if (!dev) {
         this.container.logger.info(red("Production mode"));
         await slashCommandRegistrar.globalRegister();
         await slashCommandRegistrar.guildRegister();
      }
   }

   private printBanner() {
      const llc = dev ? magentaBright : white;
      const blc = dev ? magenta : blue;

      const line03 = llc("");

      // Offset Pad
      const pad = " ".repeat(7);

      this.container.logger.info(
         String.raw`
${line03}${
            dev
               ? ` ${pad}${blc("<")}${llc("/")}${blc(">")} ${llc("DEVELOPMENT MODE")}`
               : ` ${pad}${blc("<")}${llc("/")}${blc(">")} ${llc("PRODUCTION MODE")}`
         }
		`,
      );
   }

   private printStoreDebugInformation() {
      const { client, logger } = this.container;
      const stores = [...client.stores.values()];
      const last = stores.pop()!;

      for (const store of stores) logger.info(this.styleStore(store, false));
      logger.info(this.styleStore(last, true));
   }

   private styleStore(store: Store<any>, last: boolean) {
      return gray(
         `${last ? "└─" : "├─"} Loaded ${this.style(
            store.size.toString().padEnd(3, " "),
         )} ${store.name}.`,
      );
   }
}
