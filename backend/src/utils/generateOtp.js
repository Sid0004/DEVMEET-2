// utils/generateOtp.js
import crypto from "crypto";

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString(); // e.g. "849201"
};
