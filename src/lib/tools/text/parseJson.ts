export function parseJson<Ref>(jsonString: string) {
   try {
      const o = JSON.parse(jsonString);

      if (o) return o as Ref;
   } catch (e) {
      return null;
   }

   return null;
}
