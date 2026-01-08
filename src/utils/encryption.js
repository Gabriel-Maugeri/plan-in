import CryptoJS from 'crypto-js';

const ENCRYPTION_PASSWORD = 'MiClaveSuperSecreta';
const ENCRYPTION_IV = 'AbcD$1234@8765$H';

const getKey = () => {
  return CryptoJS.SHA256(ENCRYPTION_PASSWORD);
};

const getIV = () => {
  const iv = CryptoJS.enc.Utf8.parse(ENCRYPTION_IV.substring(0, 16).padEnd(16, '0'));
  return iv;
};

export const encryptPassword = (plainText) => {
  try {
    const key = getKey();
    const iv = getIV();
    
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Error al encriptar:', error);
    throw new Error('Error al encriptar la contraseña');
  }
};
