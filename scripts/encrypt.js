const password = process.argv[2];
const string = process.argv[3];

Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = void 0;
const { blue, green } = require("colorette");
const crypto = require("crypto");
const CIPHER_ALGORITHM = "aes-256-ctr";
/**
 * Encrypt a clear-text message using AES-256 plus a random Initialization Vector.
 * @param {String} key  A passphrase of any length to used to generate a symmetric session key.
 * @param {String|Buffer} input  The clear-text message or buffer to be encrypted.
 * @returns {String|Buffer} A custom-encrypted version of the input.
 * @public
 * @method
 */
function encrypt(key, input) {
   if (key === false)
      return input;
   if (typeof key !== "string" || !key)
      throw new TypeError('Provided "key" must be a non-empty string');
   const isString = typeof input === "string";
   const isBuffer = Buffer.isBuffer(input);
   if (!(isString || isBuffer) ||
      (isString && !input) ||
      (isBuffer && !Buffer.byteLength(input)))
      throw new TypeError('Provided "input" must be a non-empty string or buffer');
   const sha256 = (0, crypto.createHash)("sha256");
   sha256.update(key);
   // Initialization Vector
   const iv = (0, crypto.randomBytes)(16);
   const cipher = (0, crypto.createCipheriv)(CIPHER_ALGORITHM, sha256.digest(), iv);
   const buffer = isString ? Buffer.from(input) : input;
   const ciphertext = cipher.update(buffer);
   const encrypted = Buffer.concat([iv, ciphertext, cipher.final()]);
   if (isString)
      return encrypted.toString("base64");
   else
      return encrypted;
}

const encrypted = encrypt(password, string);

console.log(`Encrypted string: ${green(encrypted)}`);