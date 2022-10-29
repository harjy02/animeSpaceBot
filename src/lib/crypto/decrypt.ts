import { createDecipheriv, createHash } from "crypto";
const CIPHER_ALGORITHM = "aes-256-ctr";

/**
 * Decrypt an encrypted message back to clear-text using AES-256 plus a random Initialization Vector.
 * @param {String} key  A passphrase of any length to used to generate a symmetric session key.
 * @param {String|Buffer} encrypted  The encrypted message to be decrypted.
 * @returns {String|Buffer} The original plain-text message or buffer.
 * @public
 * @method
 */
export function decrypt<EncryptedType extends string | Buffer>(
   key: string | false,
   encrypted: EncryptedType,
): EncryptedType {
   if (key === false) return encrypted;

   if (typeof key !== "string" || !key)
      throw new TypeError('Provided "key" must be a non-empty string');

   const isString = typeof encrypted === "string";
   const isBuffer = Buffer.isBuffer(encrypted);
   if (
      !(isString || isBuffer) ||
      (isString && !encrypted) ||
      (isBuffer && !Buffer.byteLength(encrypted))
   )
      throw new TypeError('Provided "encrypted" must be a non-empty string or buffer');

   const sha256 = createHash("sha256");
   sha256.update(key);

   if (isString) {
      if (encrypted.length < 17) {
         throw new TypeError(
            'Provided "encrypted" must decrypt to a non-empty string or buffer',
         );
      }
   } else {
      if (Buffer.byteLength(encrypted as Buffer) < 17) {
         throw new TypeError(
            'Provided "encrypted" must decrypt to a non-empty string or buffer',
         );
      }
   }

   const input = isString ? Buffer.from(encrypted as string, "base64") : encrypted;

   // Initialization Vector
   const iv = input.slice(0, 16);
   const decipher = createDecipheriv(CIPHER_ALGORITHM, sha256.digest(), iv);

   const ciphertext = input.slice(16);

   if (isString) {
      return [decipher.update(ciphertext), decipher.final()]
         .join(" ")
         .trim() as EncryptedType;
   } else {
      return Buffer.concat([
         decipher.update(ciphertext),
         decipher.final(),
      ]) as EncryptedType;
   }
}
