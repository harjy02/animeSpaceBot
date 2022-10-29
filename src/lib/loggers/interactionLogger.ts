import winston, { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const interactionLevels: winston.config.AbstractConfigSetLevels = {
   otherInteraction: 1,
   commandInteraction: 0,
};

interface InteractionLevels extends winston.Logger {
   otherInteraction: winston.LeveledLogMethod;
   commandInteraction: winston.LeveledLogMethod;
}

const myFormat = format.printf((info: any) => {
   const timestamp = info.timestamp.trim();
   const message = (info.message || "").trim();
   const args = info[Symbol.for("splat")];

   return [
      "##### ",
      `<span style="color:#5FB3B3">${timestamp}</span>`,
      `<span style="color:#4C4138"> | </span>`,
      `<span style="color:#ffbc42">${args}:</span>`,
      `\n${message}\n`,
   ].join("");
});

const genericInteractionTransport: DailyRotateFile = new DailyRotateFile({
   filename: "otherInteraction-%DATE%.md",
   datePattern: "YYYY-MM-DD-HH",
   frequency: "24h",
   dirname: "logs/interactionLogger/otherInteraction",
   level: "otherInteraction",
   format: filterOnly("otherInteraction"),
});

genericInteractionTransport.on("rotate", function (_oldFilename, _newFilename) {
   // do something fun
});

const commandInteractionTransport: DailyRotateFile = new DailyRotateFile({
   filename: "commandInteraction-%DATE%.md",
   datePattern: "YYYY-MM-DD-HH",
   frequency: "24h",
   dirname: "logs/interactionLogger/commandInteraction",
   level: "commandInteraction",
   format: filterOnly("commandInteraction"),
});

commandInteractionTransport.on("rotate", function (_oldFilename, _newFilename) {
   // do something fun
});

export const interactionLogger = winston.createLogger({
   levels: interactionLevels,
   format: format.combine(
      format.timestamp({
         format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.prettyPrint(),
      myFormat,
   ),
   transports: [genericInteractionTransport, commandInteractionTransport],
}) as InteractionLevels;

/**
 * Log only the messages the match `level`.
 */
function filterOnly(level: string) {
   return format((info: any) => {
      if (info.level === level) return info;
      else return false;
   })();
}
