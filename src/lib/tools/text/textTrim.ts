export function textTrim(string: string, length: number) {
   return string.length > length ? string.substring(0, length - 3) + "..." : string;
}
