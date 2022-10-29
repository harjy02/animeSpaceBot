import fetch, { RequestInit } from "node-fetch";

getWaifuPic("sfw", "waifu", "one");

//const model = load();

export async function getWaifuPic(
   type: WaifuPicType,
   category: WaifuPicCategory["swf"] | WaifuPicCategory["nsfw"],
   quantity: "many",
): Promise<MultiOutput>;
export async function getWaifuPic(
   type: WaifuPicType,
   category: WaifuPicCategory["swf"] | WaifuPicCategory["nsfw"],
   quantity: "one",
): Promise<SingleOutput>;
export async function getWaifuPic(
   type: WaifuPicType,
   category: WaifuPicCategory["swf"] | WaifuPicCategory["nsfw"],
   quantity: Quantity,
): Promise<SingleOutput | MultiOutput> {
   switch (quantity) {
      case "one": {
         const data = (await fetchWaifuData(type, category, quantity)) as SingleOutput;

         /*
         console.time();
         const imagedata = await getTf3d(data.url);
         console.timeEnd();

         console.time();
         const predictions = await (await model).classify(imagedata);
         console.timeEnd();

         console.log("Predictions: ", predictions);
         */

         return data;
      }
      case "many": {
         const data = (await fetchWaifuData(type, category, quantity)) as MultiOutput;
         return data;
      }
   }
}

type Quantity = "one" | "many";

type WaifuPicType = "sfw" | "nsfw";

interface WaifuPicCategory {
   swf:
      | "waifu"
      | "neko"
      | "shinobu"
      | "megumin"
      | "bully"
      | "cuddle"
      | "cry"
      | "hug"
      | "awoo"
      | "kiss"
      | "pat"
      | "smug"
      | "bonk"
      | "yeet"
      | "blush"
      | "smile"
      | "wave"
      | "highfive"
      | "handhold"
      | "nom"
      | "bite"
      | "glomp"
      | "slap"
      | "kill"
      | "kick"
      | "happy"
      | "wink"
      | "poke"
      | "dance"
      | "cringe";
   nsfw: "waifu" | "neko" | "trap" | "blowjob";
}

async function fetchWaifuData<Type>(
   type: WaifuPicType,
   category: WaifuPicCategory["swf"] | WaifuPicCategory["nsfw"],
   quantity: Quantity,
) {
   const requestInit: RequestInit = {
      method: quantity === "one" ? "GET" : "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
   };

   if (quantity === "many") {
      requestInit.body = JSON.stringify({
         exclude: [],
      });
   }

   const url =
      quantity === "one"
         ? `https://api.waifu.pics/${type}/${category}`
         : `https://api.waifu.pics/many/${type}/${category}`;
   const fetchData = await fetch(url, requestInit)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as Type;
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchData;
}

export interface SingleOutput {
   url: string;
}

export interface MultiOutput {
   files: string[];
}

/*
async function getTf3d(url: string) {
   const pic = await fetch(`${url}?responseType=arraybuffer`, {
      method: "GET",
      redirect: "follow",
   })
      .then((response) => response.buffer())
      .catch((error) => {
         throw error;
      });

   const image = node.decodeImage(pic, 3);
   return image;
}

// console.time();
// getTf3d("https://i.waifu.pics/tZifc8D.png");
// console.timeEnd();
*/
