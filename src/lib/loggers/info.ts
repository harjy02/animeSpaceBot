import winston, { format } from "winston";

const infoLevels: winston.config.AbstractConfigSetLevels = {
   info: 0,
};

interface InfoLevels extends winston.Logger {
   info: winston.LeveledLogMethod;
}

const myFormat = format.printf((info: any) => {
   const timestamp = info.timestamp.trim();
   const message = (info.message || "").trim();
   const args = info[Symbol.for("splat")];

   return `${timestamp} | ${message}: ${args}`;
});
export const infoLogger = winston.createLogger({
   levels: infoLevels,
   format: format.combine(
      format.timestamp({
         format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.prettyPrint(),
      myFormat,
   ),
   transports: [
      new winston.transports.File({
         filename: "info.log",
         dirname: "logs",
         level: "info",
         //format: format.simple(),
      }),
   ],
}) as InfoLevels;
