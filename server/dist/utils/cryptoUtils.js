"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCryptoKeys = initCryptoKeys;
exports.encryptDocument = encryptDocument;
exports.decryptDocument = decryptDocument;
exports.sha256 = sha256;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
// Cached keypairs for master wrap operations and author signatures
let masterPublicKey = '';
let masterPrivateKey = '';
// Generate keys once on load
function initCryptoKeys() {
    if (masterPublicKey && masterPrivateKey)
        return;
    // Resolve keys directory from DB_PATH
    const dbDir = path_1.default.isAbsolute(env_1.env.DB_PATH)
        ? path_1.default.dirname(env_1.env.DB_PATH)
        : path_1.default.resolve(__dirname, '../../', path_1.default.dirname(env_1.env.DB_PATH));
    // Ensure DB and keys directory exists
    if (!fs_1.default.existsSync(dbDir)) {
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
    const publicKeyPath = path_1.default.join(dbDir, 'master_public.pem');
    const privateKeyPath = path_1.default.join(dbDir, 'master_private.pem');
    if (fs_1.default.existsSync(publicKeyPath) && fs_1.default.existsSync(privateKeyPath)) {
        console.log(`Loading existing RSA-4096 Key Pair from volume files: ${publicKeyPath} ...`);
        masterPublicKey = fs_1.default.readFileSync(publicKeyPath, 'utf8');
        masterPrivateKey = fs_1.default.readFileSync(privateKeyPath, 'utf8');
        console.log('RSA Asymmetric Key Pair Loaded Successfully.');
    }
    else {
        console.log('Generating RSA-4096 Key Pair for Cryptographic Vault Wrapper...');
        const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        masterPublicKey = publicKey;
        masterPrivateKey = privateKey;
        try {
            fs_1.default.writeFileSync(publicKeyPath, publicKey, 'utf8');
            fs_1.default.writeFileSync(privateKeyPath, privateKey, 'utf8');
            console.log(`RSA Asymmetric Key Pair Generated and Persisted to: ${publicKeyPath}`);
        }
        catch (err) {
            console.error('Warning: Failed to persist RSA keys to disk. Keys remain in-memory only.', err);
        }
    }
}
/**
 * Executes a full security envelope on the document content block:
 * 1. Hashes the payload using SHA-256.
 * 2. Encrypts the payload with a unique AES-256-GCM key.
 * 3. Wraps the AES key using the Master RSA Public Key.
 * 4. Signs the ciphertext with the Private Key.
 */
function encryptDocument(content, authorName) {
    initCryptoKeys();
    // 1. Generate unique 256-bit symmetric key and 12-byte IV
    const aesKey = crypto_1.default.randomBytes(32);
    const iv = crypto_1.default.randomBytes(12);
    // 2. Encrypt using AES-256-GCM
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', aesKey, iv);
    let ciphertext = cipher.update(content, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    // Pack IV and auth tag in the ciphertext payload for database storage
    const packagedCiphertext = `${iv.toString('hex')}:${tag}:${ciphertext}`;
    // 3. Wrap the AES key using RSA Asymmetric Master Public Key
    const wrappedKeyBuffer = crypto_1.default.publicEncrypt({
        key: masterPublicKey,
        padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, aesKey);
    const wrappedKey = wrappedKeyBuffer.toString('hex');
    // 4. Generate Digital Signature using RSA Private Key
    const sign = crypto_1.default.createSign('RSA-SHA256');
    sign.update(packagedCiphertext);
    const signature = sign.sign({
        key: masterPrivateKey,
        padding: crypto_1.default.constants.RSA_PKCS1_PSS_PADDING
    }, 'hex');
    return {
        ciphertext: packagedCiphertext,
        wrappedKey,
        signature
    };
}
/**
 * Decrypts a document payload by verifying signature and unwrapping keys.
 */
function decryptDocument(payload) {
    initCryptoKeys();
    const { ciphertext, wrappedKey, signature } = payload;
    // 1. Verify Digital Signature
    const verify = crypto_1.default.createVerify('RSA-SHA256');
    verify.update(ciphertext);
    const isVerified = verify.verify({
        key: masterPublicKey,
        padding: crypto_1.default.constants.RSA_PKCS1_PSS_PADDING
    }, signature, 'hex');
    if (!isVerified) {
        throw new Error('Cryptographic Envelope Error: Digital Signature Verification Failed! Ciphertext is corrupt.');
    }
    // 2. Unwrap the AES key
    const aesKeyBuffer = crypto_1.default.privateDecrypt({
        key: masterPrivateKey,
        padding: crypto_1.default.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, Buffer.from(wrappedKey, 'hex'));
    // 3. Decrypt using AES-256-GCM
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
        throw new Error('Malformed packaged ciphertext block.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const rawCiphertext = parts[2];
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', aesKeyBuffer, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(rawCiphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * Simple SHA-256 utility for matching and indexing
 */
function sha256(str) {
    return crypto_1.default.createHash('sha256').update(str).digest('hex').toUpperCase();
}
