import jwt from "jsonwebtoken";

export const generateToken = ({ payload = {}, secretKey = process.env.ACCESS_TOKEN_SECRETKEY, expiresIn = "1h" }) => {
  return jwt.sign(payload, secretKey, { expiresIn });
};

export const decodeToken = ({ token = "", secretKey = process.env.ACCESS_TOKEN_SECRETKEY } = {}) => {
  return jwt.verify(token, secretKey);
};
