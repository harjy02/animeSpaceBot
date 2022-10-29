import winston, { format } from "winston";

const errorLevels: winston.config.AbstractConfigSetLevels = {
   error: 0,
};

interface ErrorLevels extends winston.Logger {
   error: winston.LeveledLogMethod;
}

const myFormat = format.printf(({ level, message, timestamp }) => {
   return `${timestamp} | ${level}:\n${message}`;
});

export const errorLogger: ErrorLevels = winston.createLogger({
   levels: errorLevels,
   format: format.combine(
      format.timestamp({
         format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.prettyPrint(),
      myFormat,
   ),
   transports: [
      new winston.transports.File({
         filename: "errorLogger.log",
         dirname: "logs",
         level: "error",
      }),
   ],
}) as ErrorLevels;
