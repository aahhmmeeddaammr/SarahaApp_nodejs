import CryptoJS from "crypto-js";
export const encodeData = ({ plainText = "", secret = "LLLLLDDDK%%%%K%%%K%%d%d" } = {}) => {
  return CryptoJS.AES.encrypt(plainText, secret);
};
export const decodeData = ({ cipherText = "", secret = "LLLLLDDDK%%%%K%%%K%%d%d" } = {}) => {
  return CryptoJS.AES.decrypt(cipherText, secret).toString(CryptoJS.enc.Utf8);
};
