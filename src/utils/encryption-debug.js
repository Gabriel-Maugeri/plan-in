import CryptoJS from 'crypto-js';

const getKey = () => {
  const password = import.meta.env.VITE_ENCRYPTION_PASSWORD;
  console.log('🔑 ENCRYPTION_PASSWORD from env:', password);
  const key = CryptoJS.SHA256(password);
  console.log('🔑 Key (SHA256):', key.toString());
  return key;
};

const getIV = () => {
  const ivString = import.meta.env.VITE_ENCRYPTION_IV;
  console.log('🔐 ENCRYPTION_IV from env:', ivString);
  const iv = CryptoJS.enc.Utf8.parse(ivString.substring(0, 16).padEnd(16, '0'));
  console.log('🔐 IV processed:', iv.toString());
  return iv;
};

export const encryptPassword = (plainText) => {
  try {
    console.log('🔒 Encrypting password:', plainText);
    const key = getKey();
    const iv = getIV();
    
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const result = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    console.log('🔒 Encrypted result:', result);
    console.log('🔒 Full encrypted (with metadata):', encrypted.toString());
    
    return result;
  } catch (error) {
    console.error('Error al encriptar:', error);
    throw new Error('Error al encriptar la contraseña');
  }
};
