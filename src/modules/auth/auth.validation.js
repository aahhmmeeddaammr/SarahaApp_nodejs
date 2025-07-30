import Joi from "joi";

const signupSchema = {
  body: Joi.object()
    .keys({
      fullName: Joi.string().required(),
      password: Joi.string().regex(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
      email: Joi.string().email().required(),
      phone: Joi.string().regex(new RegExp(/^[a-zA-Z]{1,}\d{0,}[a-zA-Z0-9]{1,}[@][a-z]{1,}(\.com|\.edu|\.net){1,3}$/)),
    })
    .required(),
};
