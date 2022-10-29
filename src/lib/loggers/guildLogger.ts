import winston, { format } from "winston";

const guildLevels: winston.config.AbstractConfigSetLevels = {
   guildJoin: 0,
   guildLeave: 0,
};

interface GuildLevels extends winston.Logger {
   guildJoin: winston.LeveledLogMethod;
   guildLeave: winston.LeveledLogMethod;
}

const myFormat = format.printf(({ level, message, timestamp }) => {
   return `${timestamp} | ${level}:\n${message}`;
});

export const guildLogger = winston.createLogger({
   levels: guildLevels,
   format: format.combine(
      format.timestamp({
         format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.prettyPrint(),
      myFormat,
   ),
   transports: [
      new winston.transports.File({
         filename: "guildLogger.log",
         dirname: "logs",
         level: "guildJoin",
      }),
   ],
}) as GuildLevels;
