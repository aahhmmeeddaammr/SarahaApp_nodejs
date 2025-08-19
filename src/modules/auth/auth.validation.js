import Joi from "joi";
import { golbalFields } from "../../utils/security/globalFields.validation.js";

export const signupSchema = {
  body: Joi.object()
    .keys({
      fullName: Joi.string().min(2).max(15).required(),
      password: golbalFields.password.required(),
      email: golbalFields.email.required(),
      phone: golbalFields.phone.required(),
    })
    .required(),
};

export const signinSchema = {
  body: Joi.object()
    .keys({
      password: golbalFields.password.required(),
      email: golbalFields.email.required(),
    })
    .required(),
};

export const forgetPassword = {
  body: Joi.object()
    .keys({
      email: golbalFields.email.required(),
    })
    .required(),
};

export const verifyResetCode = {
  body: Joi.object()
    .keys({
      email: golbalFields.email.required(),
      otp: Joi.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required(),
    })
    .required(),
};

export const resetPassword = {
  body: Joi.object().keys({
    email : golbalFields.email.required(),
    password : golbalFields.password.required(),
  }),
};
