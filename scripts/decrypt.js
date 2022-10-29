const password = process.argv[2];
const string = process.argv[3];

Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = void 0;
const { red } = require("colorette");
const crypto = require("crypto");
const CIPHER_ALGORITHM = "aes-256-ctr";
/**
 * Decrypt an encrypted message back to clear-text using AES-256 plus a random Initialization Vector.
 * @param {String} key  A passphrase of any length to used to generate a symmetric session key.
 * @param {String|Buffer} encrypted  The encrypted message to be decrypted.
 * @returns {String|Buffer} The original plain-text message or buffer.
 * @public
 * @method
 */
function decrypt(key, encrypted) {
   if (key === false)
      return encrypted;
   if (typeof key !== "string" || !key)
      throw new TypeError('Provided "key" must be a non-empty string');
   const isString = typeof encrypted === "string";
   const isBuffer = Buffer.isBuffer(encrypted);
   if (!(isString || isBuffer) ||
      (isString && !encrypted) ||
      (isBuffer && !Buffer.byteLength(encrypted)))
      throw new TypeError('Provided "encrypted" must be a non-empty string or buffer');
   const sha256 = (0, crypto.createHash)("sha256");
   sha256.update(key);
   if (isString) {
      if (encrypted.length < 17)
         throw new TypeError('Provided "encrypted" must decrypt to a non-empty string or buffer');

   } else {
      if (Buffer.byteLength(encrypted) < 17)
         throw new TypeError('Provided "encrypted" must decrypt to a non-empty string or buffer');

   }
   const input = isString ? Buffer.from(encrypted, "base64") : encrypted;
   // Initialization Vector
   const iv = input.slice(0, 16);
   const decipher = (0, crypto.createDecipheriv)(CIPHER_ALGORITHM, sha256.digest(), iv);
   const ciphertext = input.slice(16);
   if (isString) {
      return [decipher.update(ciphertext), decipher.final()]
         .join(" ")
         .trim();
   } else {
      return Buffer.concat([
         decipher.update(ciphertext),
         decipher.final(),
      ]);
   }
}

const encrypted = decrypt(password, string);

console.log(`Decrypted string: ${red(encrypted)}`);