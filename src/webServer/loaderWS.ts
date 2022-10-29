import type { AnilogWS } from "./anilogWS";
import { magenta } from "colorette";
import { container } from "@sapphire/pieces";

let anilogWs: AnilogWS;

export function loadWebserver(): void {
   const ws = require("./anilogWS");
   anilogWs = new ws.AnilogWS();
}

export function reloadWebServer(): void {
   if (anilogWs) {
      container.logger.info(magenta("Anilog webServer restarting.."));
      anilogWs.stop().then(() => {
         delete require.cache[require.resolve("./anilogWS")];
         loadWebserver();
      });
   } else {
      container.logger.info(
         "The server has not yet started..., start it before restarting it!",
      );
      return;
   }
}
