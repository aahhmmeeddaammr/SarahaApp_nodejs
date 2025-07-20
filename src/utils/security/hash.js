import bcrypt from "bcryptjs";

export const hash = async ({ plainText = "", salt = 14 } = {}) => {
  const hashedData = bcrypt.hashSync(plainText, salt);
  return hashedData;
};

export const compare = ({ plainText = "", hashed = "" } = {}) => {
  const result = bcrypt.compareSync(plainText, hashed);
  return result;
};
