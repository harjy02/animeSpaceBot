import { catchNewError } from "lib/errors/errorHandling";

export function nullCheck({ ...variables }) {
   for (const each in variables)
      if (!variables[each]) catchNewError(`${each} is not defined`);
}
