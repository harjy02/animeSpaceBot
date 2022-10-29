import dotenv from "dotenv";
import { botLogin } from "lib/botLogin";
import { decrypt } from "lib/crypto/decrypt";
import { nullCheck } from "lib/tools/nullCheck";

//set up env variables in process.env
dotenv.config({ path: ".env" });

//non-encrypted
export const envSupportGuild = process.env.SUPPORT_GUILD_ID as string;
export const envOwners = process.env.OWNERS?.split(",") as string[];
export const envEnviroment = process.env.NODE_ENV as "development" | "production";

//decryption data
const productionState = envEnviroment === "production";

export const loginKey = productionState ? botLogin() : false;
if (productionState && !loginKey) {
   console.log("too many attempts..., exiting.");
   process.exit();
}

//encrypted discord credential

export const envDiscordToken = decrypt(
   loginKey as string,
   process.env.DISCORD_TOKEN as string,
);

export const envDiscordClientSecret = decrypt(
   loginKey as string,
   process.env.DISCORD_CLIENT_SECRET as string,
);

//encrypted anilist credential

export const envAnilistClientSecret = decrypt(
   loginKey as string,
   process.env.ANILIST_CLIENT_SECRET as string,
);

export const envAnilistClientId = decrypt(
   loginKey as string,
   process.env.ANILIST_CLIENT_ID as string,
);

//encrypted db

export const envMysqlDatabaseUrl = decrypt(
   loginKey as string,
   process.env.MYSQL_DATABASE_URL as string,
);

//encrypted webserver

export const envWebServerUrl = decrypt(
   loginKey as string,
   process.env.WEBSERVER_URL as string,
);

export const envWebServerPort = decrypt(
   loginKey as string,
   process.env.WEBSERVER_PORT as string,
);

nullCheck({
   envSupportGuild,
   envOwners,
   envDiscordToken,
   envDiscordClientSecret,
   envAnilistClientSecret,
   envAnilistClientId,
   envMysqlDatabaseUrl,
   envWebServerUrl,
   envWebServerPort,
});

//webserver stuff

export const webServerDiscordRedirect = (state: string) => {
   const redirect = `https://discord.com/api/oauth2/authorize?client_id=${discord_credential.client_id}&redirect_uri=http%3A%2F%2F${envWebServerUrl}%3A${envWebServerPort}%2FdiscordLogin&response_type=code&scope=identify&state=${state}`;
   return redirect;
};

//credentials
export const discord_credential = {
   client_id: "967820041057890314",
   client_secret: envDiscordClientSecret,
   redirect_url: `http://${envWebServerUrl}:${envWebServerPort}/discordLogin`,
};
export const anilist_credential = {
   client_id: envAnilistClientId,
   client_secret: envAnilistClientSecret,
   redirect_url:
      envEnviroment === "development"
         ? "https://anilist.co/api/v2/oauth/pin"
         : `http://${envWebServerUrl}:${envWebServerPort}/anilistLogin`,
};

//bot specific
export const botLogo = "https://i.imgur.com/za99tn3.png";
export const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${discord_credential.client_id}&permissions=0&scope=bot%20applications.commands`;

//support server
export const changelogChannelId = "894640815572398171";
export const betaTesterRoleId = "980060389616279552";

//bot external links
export const supportServerInviteLink = "https://discord.gg/sYAceP6Pmf";
export const botTopGgPage = `https://top.gg/bot/${discord_credential.client_id}`;

//bot status

export let testingMode = false;
export function testingModeState(state: boolean) {
   testingMode = state;
}
