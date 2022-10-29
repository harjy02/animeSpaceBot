import { blue, red } from "colorette";

import ErrorStackParser from "error-stack-parser";
import { asTree } from "lib/tools/treeify";
import { errorLogger } from "lib/loggers/errorLogger";
import { errorExceptions } from "assets/errorExceptions";

export function catchNewError(error: Error | string | any, additionalData?: object) {
   if (typeof error === "string") error = new Error(error);

   if (error instanceof Error)
      for (const each of errorExceptions) if (error.message.includes(each)) return;

   const catchError = new CatchError(error);

   if (additionalData) catchError.addData(additionalData);

   catchError.log();

   return catchError.errorData.errorId;
}

interface ErrorData {
   errorId: string;
   errorInfo:
      | {
           name: string;
           message: string;
           stack: string[];
        }
      | object
      | string;
}

class CatchError {
   public errorData: ErrorData;
   private additionalData: object | null = null;

   constructor(error: Error | any) {
      const errorInfo =
         error instanceof Error
            ? {
                 stack: parseError(ErrorStackParser.parse(error)),
                 ...error,
              }
            : typeof error === "object"
            ? (error as object)
            : JSON.parse(error);

      this.errorData = {
         message: error.message,
         errorId: Date.now().toString(36),
         ...errorInfo,
      };
   }

   public addData(data: object) {
      if (!this.additionalData) this.additionalData = {};
      Object.assign(this.additionalData, data);
      return this;
   }

   public log() {
      const data = {
         errorData: this.errorData,
         additionalData: this.additionalData,
      };

      errorLogger.error(asTree(data));

      console.error(
         blue("There was some error, logged with ID:  ") + red(this.errorData.errorId),
      );

      if (typeof this.errorData === "object") console.error(asTree(this.errorData));

      if (typeof this.errorData === "string") return console.error(this.errorData);
   }
}

function parseError(stack: StackFrame[]) {
   const returnData: StackErrorData = {};

   for (const each of stack) {
      returnData[each.fileName || "fileName not available"] = {
         columnNumber: each.columnNumber,
         lineNumber: each.lineNumber,
      };
   }

   return returnData;
}

interface StackErrorData {
   [string: string]: {
      columnNumber?: number;
      lineNumber?: number;
   };
}
