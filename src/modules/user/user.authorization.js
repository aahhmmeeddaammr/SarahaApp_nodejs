import { roleEnum } from "../../DB/models/User.model.js";

export const userEndpoints = {
  deleteAccount: [roleEnum.admin],
  restoreAccount: [roleEnum.admin],
};
