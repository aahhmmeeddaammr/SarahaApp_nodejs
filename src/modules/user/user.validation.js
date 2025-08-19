import Joi from "joi";
import { golbalFields } from "./../../utils/security/globalFields.validation.js";

export const getProfileById = {
  params: Joi.object()
    .keys({
      userId: golbalFields.id,
    })
    .required(),
};

export const updateUserPassword = {
  body: Joi.object()
    .keys({
      oldPassword: golbalFields.password,
      newPassword: golbalFields.password,
    })
    .required(),
};

export const updateProfileData = {
  body: Joi.object()
    .keys({
      firstName: Joi.string().min(2),
      lastName: Joi.string().min(2),
      bio: Joi.string(),
    })
    .or("firstName", "lastName", "bio"),
};
