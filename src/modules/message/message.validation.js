import Joi from "joi";
import { golbalFields } from "../../utils/security/globalFields.validation.js";

export const guestSendMessageSchema = {
  body: Joi.object()
    .keys({
      recipientId: golbalFields.id.required(),
      content: Joi.string().required(),
      fromName: Joi.string().min(2),
    })
    .required(),
};
