import { MessageEmbed, User } from "discord.js";

import type { WsUserData } from "./lib/wsUserInfo";
import { textJoin } from "lib/tools/text/textJoin";

export async function setConfirmHtml(
   guild: {
      name: string;
   },
   discordUser: User,
   userData: WsUserData,
) {
   //__<edit_message>

   const embed = new MessageEmbed()
      .setTitle("Authentication completed")
      .setDescription(
         textJoin([
            `User: [${userData.name}](${userData.siteUrl})`,
            `Source: Anilist`,
            `Guild: ${guild.name}`,
         ]),
      )
      .setThumbnail(userData.avatar)
      .setTimestamp();

   discordUser.send({ embeds: [embed] });

   //__</edit_message>

   const html = /* HTML */ `
      <html>
         <head>
            <style>
               #container {
                  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
                     0 6px 20px 0 rgba(0, 0, 0, 0.19);
                  background: #202020;
                  border-radius: 15px;
                  width: 460px;
                  height: 300px;
                  display: grid;
               }

               .centre {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  -moz-transform: translateX(-50%) translateY(-50%);
                  -webkit-transform: translateX(-50%) translateY(-50%);
                  transform: translateX(-50%) translateY(-50%);
               }

               .font {
                  color: white;
                  text-align: center;
               }
            </style>
         </head>
         <body style="background-color: #121212">
            <div id="container" class="centre"></div>
            <div
               style="color: #A7D129; height: 300px; font-family: Arial, Helvetica, sans-serif; font-size: large;"
               class="centre font"
            >
               <h2>Profile successfully connected!</h2>
            </div>
            <div
               style="font-family: Arial, Helvetica, sans-serif; font-size: 19px;"
               class="centre font"
            >
               <p>
                  Your Anilist profile has been successfully<br />
                  connected to Anime Space bot.
               </p>
            </div>
            <div
               style="margin-top: 110px; font-family: Arial, Helvetica, sans-serif; font-size: small;"
               class="centre font"
            >
               <p>Now you can leave this page and return on discord.</p>
            </div>
         </body>
      </html>
   `;
   return html;
}

export function setErrorHtml(message: string) {
   const html = /* HTML */ `
      <html>
         <head>
            <style>
               #container {
                  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
                     0 6px 20px 0 rgba(0, 0, 0, 0.19);
                  background: #202020;
                  border-radius: 15px;
                  width: 460px;
                  height: 300px;
                  display: grid;
               }

               .centre {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  -moz-transform: translateX(-50%) translateY(-50%);
                  -webkit-transform: translateX(-50%) translateY(-50%);
                  transform: translateX(-50%) translateY(-50%);
               }

               .font {
                  color: white;
                  text-align: center;
               }
            </style>
         </head>
         <body style="background-color: #121212">
            <div id="container" class="centre"></div>
            <div
               style="
         color: #da0037;
         height: 300px;
         font-family: Arial, Helvetica, sans-serif;
         font-size: large;
       "
               class="centre font"
            >
               <h2>Something went wrong...</h2>
            </div>
            <div
               style="font-family: Arial, Helvetica, sans-serif; font-size: 19px"
               class="centre font"
            >
               <p>${message.replace("\n", "<br />")}</p>
            </div>
            <div
               style="
         margin-top: 110px;
         font-family: Arial, Helvetica, sans-serif;
         font-size: small;
       "
               class="centre font"
            >
               <p>Try going back to discord and rerunning the command</p>
            </div>
         </body>
      </html>
   `;
   return html;
}

export function setWrongAccountHtml() {
   const html = /* HTML */ `
      <html>
         <head>
            <style>
               #container {
                  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
                     0 6px 20px 0 rgba(0, 0, 0, 0.19);
                  background: #202020;
                  border-radius: 15px;
                  width: 460px;
                  height: 600px;
                  display: grid;
               }

               .centre {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  -moz-transform: translateX(-50%) translateY(-50%);
                  -webkit-transform: translateX(-50%) translateY(-50%);
                  transform: translateX(-50%) translateY(-50%);
               }

               .font {
                  color: white;
                  text-align: center;
               }

               .myButton {
                  box-shadow: inset 0px 1px 3px 0px #3e7327;
                  background-color: transparent;
                  border-radius: 5px;
                  border: 1px solid #4b8f29;
                  display: inline-block;
                  cursor: pointer;
                  color: #ffffff;
                  font-family: Arial;
                  font-size: 15px;
                  font-weight: bold;
                  padding: 11px 23px;
                  text-decoration: none;
                  text-shadow: 0px -1px 0px #5b8a3c;
               }
               .myButton:hover {
                  background-color: transparent;
               }
               .myButton:active {
                  position: relative;
                  top: 1px;
               }
            </style>
         </head>
         <body style="background-color: #121212">
            <script>
               function goBack() {
                  window.history.back();
               }
            </script>
            <div id="container" class="centre"></div>
            <div
               style="
         color: #da0037;
         height: 580px;
         font-family: Arial, Helvetica, sans-serif;
         font-size: large;
       "
               class="centre font"
            >
               <h2>Something went wrong...</h2>
            </div>
            <div
               style="font-family: Arial, Helvetica, sans-serif; font-size: 17px"
               class="centre font"
            >
               <p>
                  The account you logged in with discord is not <br />
                  the same as the one you started the command.<br /><br />Return to
                  previous page and change the account<br />as show below.
               </p>
               <img src="https://i.imgur.com/KOKZSlR.png" style="max-width: 380" />
            </div>
            <div
               style="
         margin-top: 260px;
         font-family: Arial, Helvetica, sans-serif;
         font-size: small;
       "
               class="centre font"
            >
               <button onclick="goBack()" class="myButton">Go Back</button>
            </div>
         </body>
      </html>
   `;
   return html;
}
