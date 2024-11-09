const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes for AES-256
const IV_LENGTH = 16; // For AES, this is 16

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(encryptedText) {
    let parts = encryptedText.split(':');
    let iv = Buffer.from(parts[0], 'hex');
    let encrypted = Buffer.from(parts[1], 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


function verify(text) {
    if (!text) {
        text = crypto.randomBytes(8).toString('hex'); 
    }

    const intext = encrypt(text);
    const outext = decrypt(intext);
    return text === outext;
}

const encryption = {
    encrypt: encrypt,
    decrypt: decrypt,
    verify: verify,
  };

module.exports = encryption;
