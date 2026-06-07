import crypto from 'crypto';

// Cached keypairs for master wrap operations and author signatures
let masterPublicKey: string = '';
let masterPrivateKey: string = '';

// Generate keys once on load
export function initCryptoKeys() {
  if (masterPublicKey && masterPrivateKey) return;

  console.log('Generating RSA-4096 Key Pair for Cryptographic Vault Wrapper...');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  masterPublicKey = publicKey;
  masterPrivateKey = privateKey;
  console.log('RSA Asymmetric Key Pair Generated.');
}

export interface EncryptedPayload {
  ciphertext: string;
  wrappedKey: string;
  signature: string;
}

/**
 * Executes a full security envelope on the document content block:
 * 1. Hashes the payload using SHA-256.
 * 2. Encrypts the payload with a unique AES-256-GCM key.
 * 3. Wraps the AES key using the Master RSA Public Key.
 * 4. Signs the ciphertext with the Private Key.
 */
export function encryptDocument(content: string, authorName: string): EncryptedPayload {
  initCryptoKeys();

  // 1. Generate unique 256-bit symmetric key and 12-byte IV
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  // 2. Encrypt using AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  let ciphertext = cipher.update(content, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  
  // Pack IV and auth tag in the ciphertext payload for database storage
  const packagedCiphertext = `${iv.toString('hex')}:${tag}:${ciphertext}`;

  // 3. Wrap the AES key using RSA Asymmetric Master Public Key
  const wrappedKeyBuffer = crypto.publicEncrypt(
    {
      key: masterPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    aesKey
  );
  const wrappedKey = wrappedKeyBuffer.toString('hex');

  // 4. Generate Digital Signature using RSA Private Key
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(packagedCiphertext);
  const signature = sign.sign(
    {
      key: masterPrivateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING
    },
    'hex'
  );

  return {
    ciphertext: packagedCiphertext,
    wrappedKey,
    signature
  };
}

/**
 * Decrypts a document payload by verifying signature and unwrapping keys.
 */
export function decryptDocument(payload: EncryptedPayload): string {
  initCryptoKeys();

  const { ciphertext, wrappedKey, signature } = payload;

  // 1. Verify Digital Signature
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(ciphertext);
  const isVerified = verify.verify(
    {
      key: masterPublicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING
    },
    signature,
    'hex'
  );

  if (!isVerified) {
    throw new Error('Cryptographic Envelope Error: Digital Signature Verification Failed! Ciphertext is corrupt.');
  }

  // 2. Unwrap the AES key
  const aesKeyBuffer = crypto.privateDecrypt(
    {
      key: masterPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(wrappedKey, 'hex')
  );

  // 3. Decrypt using AES-256-GCM
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed packaged ciphertext block.');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const rawCiphertext = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKeyBuffer, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(rawCiphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Simple SHA-256 utility for matching and indexing
 */
export function sha256(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').toUpperCase();
}
