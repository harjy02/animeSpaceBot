export function stringParam(string: string) {
   const variables: Replaceable[] = [
      {
         name: "anilist",
         value: "[anilist](https://anilist.co/home)",
      },
   ];

   variables.forEach(
      (value) => (string = string.replace(RegExp(`:${value.name}:`, "g"), value.value)),
   );

   return string;
}

interface Replaceable {
   name: string;
   value: string;
}
