import { loginKey } from "assets/config";
import type AuthData from "cluster/anilist/models/authData";
import { decrypt } from "lib/crypto/decrypt";
import fetch from "node-fetch";

/**
 * @param {object} authentication the authentication object
 * @param {number} id id for anilist
 * @param {number} idMal idMal for myanimelist
 * @returns {Promise<Boolean>} true: is anime has been added to planning | false: if it hasn't
 */
export async function addPlanning(authData: AuthData, idAl: number) {
   const hash = authData.accessToken;
   const token = decrypt(loginKey, hash);
   const mutationOptions = {
      method: "POST",
      headers: {
         "Authorization": "Bearer " + token,
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: /* GraphQL */ `
            mutation ($idAl: Int) {
               SaveMediaListEntry(mediaId: $idAl, status: PLANNING) {
                  status
               }
            }
         `,
         variables: { idAl },
      }),
   };

   const mutationResults = await fetch("https://graphql.anilist.co", mutationOptions)
      .then((response) => response.text())
      .then((result) => JSON.parse(result))
      .catch((error) => {
         throw error;
      });

   const mutationData = mutationResults.data.SaveMediaListEntry;

   if (mutationData.status === "PLANNING") return true;
   else return false;
}
