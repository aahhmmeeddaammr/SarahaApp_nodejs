import Joi from "joi";
import mongoose from "mongoose";

export const golbalFields = {
  password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  email: Joi.string().email(),
  id: Joi.string()
    .length(24)
    .custom((value, helper) => {
      try {
        new mongoose.Types.ObjectId(value);
        return value;
      } catch (error) {
        return helper.message("Invalid MongoDB ObjectId");
      }
    }),

  fullName: Joi.string().pattern(/^[A-Za-z]{2,10} [A-Za-z]{2,10}$/),
  phone: Joi.string().regex(new RegExp(/^01[1250][0-9]{8}$/)),
};
