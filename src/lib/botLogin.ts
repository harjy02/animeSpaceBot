import { question } from "readline-sync";
import { createHash } from "crypto";

const LoginPasswordHash =
   "f23528c1e62ccd6009d7e15525468bdf8bd9ec3092975830804eb70262c4b735";

export function botLogin() {
   console.log("input the login password");

   let password = question("Login-Password: ", { hideEchoBack: true });

   let hash = createHash("sha256").update(password).digest("hex");

   if (hash !== LoginPasswordHash) {
      for (let i = 0; i < 3; i++) {
         console.log("The inputted password was wrong, retry:");

         console.log("input the login password");
         const rePassword = question("Login-Password: ", { hideEchoBack: true });

         const reHash = createHash("sha256").update(rePassword).digest("hex");

         if (reHash === LoginPasswordHash) {
            password = rePassword;
            hash = reHash;
            break;
         }
      }
   }

   return hash === LoginPasswordHash ? password : false;
}
