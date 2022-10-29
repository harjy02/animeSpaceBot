import winston, { format } from "winston";

const suggestionLevels: winston.config.AbstractConfigSetLevels = {
   suggestion: 0,
};

interface SuggestionLevels extends winston.Logger {
   suggestion: winston.LeveledLogMethod;
}

const myFormat = format.printf(({ level, message, timestamp }) => {
   return `${timestamp} | ${level}:\n${message}`;
});

export const suggestionLogger = winston.createLogger({
   levels: suggestionLevels,
   format: format.combine(
      format.timestamp({
         format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.prettyPrint(),
      myFormat,
   ),
   transports: [
      new winston.transports.File({
         filename: "suggestionLogger.log",
         dirname: "logs",
         level: "suggestion",
      }),
   ],
}) as SuggestionLevels;
