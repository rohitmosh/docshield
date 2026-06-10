"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const FileRepository_1 = require("../repositories/FileRepository");
const AuditRepository_1 = require("../repositories/AuditRepository");
const cryptoUtils_1 = require("../utils/cryptoUtils");
class CryptoService {
    static verifyAndDecrypt(docId, user, ip, version) {
        let file;
        if (version) {
            file = FileRepository_1.FileRepository.findVersion(docId, version);
            if (!file)
                throw new Error('Historical version not found');
        }
        else {
            file = FileRepository_1.FileRepository.findById(docId);
            if (!file)
                throw new Error('File not found');
        }
        if (file.classification === 'PUBLIC') {
            return {
                verified: true,
                content: file.content,
                checksum: (0, cryptoUtils_1.sha256)(file.name + file.size),
                message: 'Public document requires no cryptographic envelope decryption.'
            };
        }
        if (!file.ciphertext || !file.wrapped_key || !file.signature) {
            throw new Error('Document is missing key security wrapper metadata blocks');
        }
        try {
            // Execute Node.js native RSA unwrap + AES-GCM verification decipher
            const decryptedContent = (0, cryptoUtils_1.decryptDocument)({
                ciphertext: file.ciphertext,
                wrappedKey: file.wrapped_key,
                signature: file.signature
            });
            // Audit Log
            const log = {
                id: 'aud-' + Math.random().toString(36).substring(2, 11),
                timestamp: this.formatDate(new Date()),
                user: user.email || user.name,
                role: user.role,
                action: 'Verify Cryptographic Envelope',
                resource: version ? `${file.name} (version ${version})` : file.name,
                status: 'Success',
                ip_address: ip
            };
            AuditRepository_1.AuditRepository.create(log);
            return {
                verified: true,
                content: decryptedContent,
                checksum: (0, cryptoUtils_1.sha256)(file.name + file.size),
                signature: file.signature,
                wrappedKey: file.wrapped_key
            };
        }
        catch (e) {
            // Audit Log Failure
            const log = {
                id: 'aud-' + Math.random().toString(36).substring(2, 11),
                timestamp: this.formatDate(new Date()),
                user: user.email || user.name,
                role: user.role,
                action: 'Verify Cryptographic Envelope',
                resource: version ? `${file.name} (version ${version})` : file.name,
                status: 'Failure: Decrypt Refused',
                ip_address: ip
            };
            AuditRepository_1.AuditRepository.create(log);
            throw new Error(`Envelope Verification Failed: ${e.message}`);
        }
    }
    static formatDate(now) {
        const day = String(now.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        return `${day}-${month}-${year} ${hrs}:${mins}:${secs}`;
    }
}
exports.CryptoService = CryptoService;
