import { createCipheriv, createHash, randomBytes } from "crypto";

const CIPHER_ALGORITHM = "aes-256-ctr";

/**
 * Encrypt a clear-text message using AES-256 plus a random Initialization Vector.
 * @param {String} key  A passphrase of any length to used to generate a symmetric session key.
 * @param {String|Buffer} input  The clear-text message or buffer to be encrypted.
 * @returns {String|Buffer} A custom-encrypted version of the input.
 * @public
 * @method
 */
export function encrypt<EncryptedType extends string | Buffer>(
   key: string | false,
   input: EncryptedType,
): EncryptedType {
   if (key === false) return input;

   if (typeof key !== "string" || !key)
      throw new TypeError('Provided "key" must be a non-empty string');

   const isString = typeof input === "string";
   const isBuffer = Buffer.isBuffer(input);
   if (
      !(isString || isBuffer) ||
      (isString && !input) ||
      (isBuffer && !Buffer.byteLength(input))
   )
      throw new TypeError('Provided "input" must be a non-empty string or buffer');

   const sha256 = createHash("sha256");
   sha256.update(key);

   // Initialization Vector
   const iv = randomBytes(16);
   const cipher = createCipheriv(CIPHER_ALGORITHM, sha256.digest(), iv);

   const buffer = isString ? Buffer.from(input) : input;

   const ciphertext = cipher.update(buffer);

   const encrypted = Buffer.concat([iv, ciphertext, cipher.final()]);

   if (isString) return encrypted.toString("base64") as EncryptedType;
   else return encrypted as EncryptedType;
}